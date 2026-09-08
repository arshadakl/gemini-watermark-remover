/**
 * Video watermark removal processor.
 *
 * Pipeline: demux → detect → decode → inpaint → encode → mux.
 * Uses WebCodecs for decode/encode, mp4box for demux, mp4-muxer for mux.
 *
 * Port of Erasio's page/videoProcessor.js, refactored to use shared modules.
 */

import type { ProgressState, VideoProcessOptions } from './types'
import {
  OPACITY_LEVELS,
  VIDEO_MASK_720_SIZE,
  VIDEO_MASK_1080_SIZE,
  OFFSETS_720,
  OFFSETS_1080,
  SUPPORTED_VIDEO_DIMS,
  ALPHA_THRESHOLD,
  GAIN_DRIFT,
  EDGE_STRENGTH,
  EDGE_RADIUS,
  EDGE_MAX_PASSES,
  AAC_SAMPLE_RATES,
  BITRATE_MIN,
  BITRATE_MAX,
  BITRATE_FORMULA_FACTOR,
} from './constants'
import { clamp } from './utils'
import { pearsonNCC } from './ncc'
import { rescaleBilinear } from './rescale'
import { reverseBlend } from './blend'
import { VIDEO_MASK_720_B64, VIDEO_MASK_1080_B64, decodeVideoMask } from './videoMasks'
// @ts-expect-error — mp4box has no TypeScript declarations
import { createFile, DataStream as Mp4DataStream } from 'mp4box'

const TAG = '[VideoProcessor]'

// ── Helpers ───────────────────────────────────────────────────────────────────

function report(onProgress: VideoProcessOptions['onProgress'], stage: ProgressState['stage'], ratio: number) {
  onProgress?.({ stage, ratio: clamp(ratio, 0, 1) })
}

function extractVideoDescription(file: any, track: any): Uint8Array | null {
  const trak = file.getTrackById(track.id)
  const entries =
    trak?.mdia?.minf?.stbl?.stsd?.entries ?? []
  for (const e of entries) {
    const cfg = e.avcC || e.hvcC || e.vpcC || e.av1C
    if (!cfg) continue
    // DataStream is exposed by mp4box.js
    const DS = Mp4DataStream ?? (typeof DataStream !== 'undefined' ? DataStream : null)
    if (!DS) return null
    const ds = new DS(undefined, 0, DS.BIG_ENDIAN)
    cfg.write(ds)
    return new Uint8Array(ds.buffer, 8)
  }
  return null
}

// ── Demux ─────────────────────────────────────────────────────────────────────

interface DemuxResult {
  videoTrack: any
  audioTrack: any
  videoSamples: any[]
  audioSamples: any[]
  videoDescription: Uint8Array | null
}

function demuxMp4(arrayBuffer: ArrayBuffer): Promise<DemuxResult> {
  return new Promise((resolve, reject) => {
    const file = createFile()
    const videoSamples: any[] = []
    const audioSamples: any[] = []
    let videoTrack: any = null
    let audioTrack: any = null

    file.onError = (e: any) => reject(new Error('mp4box demux error: ' + e))

    file.onReady = (info: any) => {
      videoTrack = info.videoTracks?.[0]
      audioTrack = info.audioTracks?.[0]
      if (!videoTrack) {
        reject(new Error('No video track found in file'))
        return
      }
      file.setExtractionOptions(videoTrack.id, 'video', { nbSamples: 1000000 })
      if (audioTrack) {
        file.setExtractionOptions(audioTrack.id, 'audio', { nbSamples: 1000000 })
      }
      file.start()
    }

    file.onSamples = (id: number, user: string, samples: any[]) => {
      const bucket = user === 'video' ? videoSamples : audioSamples
      for (const s of samples) {
        bucket.push({
          data: s.data.slice(0),
          cts: s.cts,
          dts: s.dts,
          duration: s.duration,
          timescale: s.timescale,
          is_sync: s.is_sync,
        })
      }
    }

    const buf = arrayBuffer.slice(0)
    ;(buf as any).fileStart = 0
    file.appendBuffer(buf)
    file.flush()

    if (!videoTrack) {
      reject(new Error('No video track found in file'))
      return
    }
    const videoDescription = extractVideoDescription(file, videoTrack)
    resolve({ videoTrack, audioTrack, videoSamples, audioSamples, videoDescription })
  })
}

// ── Alpha map loading ─────────────────────────────────────────────────────────

const _mapCache = new Map<string, { values: Float32Array; colorValues?: Float32Array; width: number; height: number }>()

async function loadAlphaMap(b64: string, size: number, withColor: boolean) {
  const key = `${size}|${withColor ? 'rgba' : 'alpha'}`
  if (_mapCache.has(key)) return _mapCache.get(key)!
  const result = await decodeVideoMask(b64, size, withColor)
  _mapCache.set(key, result)
  return result
}

// ── Opacity estimation ────────────────────────────────────────────────────────

function estimateOpacity(imageData: ImageData, cand: {
  alphaMap: { values: Float32Array; colorValues?: Float32Array; width: number; height: number }
  x: number; y: number; baseStrength: number
}): number {
  if (cand.alphaMap.colorValues !== undefined) return 1

  const { width, data } = imageData
  const mw = cand.alphaMap.width
  const mh = cand.alphaMap.height
  const pad = Math.max(8, Math.round(0.25 * mw))
  const x0 = Math.max(0, cand.x - pad)
  const y0 = Math.max(0, cand.y - pad)
  const x1 = Math.min(width, cand.x + mw + pad)
  const y1 = Math.min(imageData.height, cand.y + mh + pad)

  let sum = 0, n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (x >= cand.x && x < cand.x + mw && y >= cand.y && y < cand.y + mh) continue
      const idx = (y * width + x) * 4
      sum += 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2]
      n++
    }
  }
  const surroundingLuma = n > 0 ? sum / n : 128

  let bestOpacity = OPACITY_LEVELS[0], bestError = Infinity
  const colorMap = cand.alphaMap.colorValues

  for (const op of OPACITY_LEVELS) {
    let errSum = 0, weightSum = 0
    for (let row = 0; row < mh; row++) {
      for (let col = 0; col < mw; col++) {
        const mi = row * mw + col
        const a = cand.alphaMap.values[mi]
        if (a <= 0.04) continue
        const p = Math.min(a * cand.baseStrength * op, op)
        const oneMinusP = 1 - p
        if (oneMinusP <= 1e-4) continue
        const idx = ((cand.y + row) * width + cand.x + col) * 4
        const er = colorMap ? colorMap[3 * mi] : 250
        const eg = colorMap ? colorMap[3 * mi + 1] : 250
        const eb = colorMap ? colorMap[3 * mi + 2] : 250
        const luma =
          0.2126 * ((data[idx] - p * er) / oneMinusP) +
          0.7152 * ((data[idx + 1] - p * eg) / oneMinusP) +
          0.0722 * ((data[idx + 2] - p * eb) / oneMinusP)
        const w = Math.min(1, 8 * a)
        errSum += Math.abs(luma - surroundingLuma) * w
        weightSum += w
      }
    }
    const err = weightSum > 0 ? errSum / weightSum : Infinity
    if (err < bestError) { bestError = err; bestOpacity = op }
  }
  return bestOpacity
}

// ── Inpaint frame ─────────────────────────────────────────────────────────────

function inpaintFrame(imageData: ImageData, cand: {
  alphaMap: { values: Float32Array; colorValues?: Float32Array; width: number; height: number }
  x: number; y: number; baseStrength: number; opacity: number
  overlayValue?: number; ceiling?: number
  edgeCleanup?: { strength: number; radius: number; maxPasses: number }
}): ImageData {
  const out = new Uint8ClampedArray(imageData.data)
  const { width } = imageData
  const opacity = cand.opacity
  const ceiling = cand.ceiling ?? 1
  const hasColor = cand.alphaMap.colorValues !== undefined
  const colorMap = cand.alphaMap.colorValues
  const overlayValue = cand.overlayValue ?? 250
  const mw = cand.alphaMap.width
  const mh = cand.alphaMap.height
  const cleanupMask = cand.edgeCleanup ? new Uint8Array(mw * mh) : null

  for (let row = 0; row < mh; row++) {
    for (let col = 0; col < mw; col++) {
      const mi = row * mw + col
      const p = Math.min(cand.alphaMap.values[mi] * cand.baseStrength * opacity, ceiling)
      if (p < ALPHA_THRESHOLD) continue
      const oneMinusP = 1 - p
      if (oneMinusP <= 1e-4) continue
      if (cleanupMask) cleanupMask[mi] = 1
      const idx = ((cand.y + row) * width + cand.x + col) * 4
      for (let ch = 0; ch < 3; ch++) {
        const expected = hasColor && colorMap ? colorMap[3 * mi + ch] : overlayValue
        out[idx + ch] = Math.round(clamp((imageData.data[idx + ch] - p * expected) / oneMinusP, 0, 255))
      }
    }
  }

  // Edge diffusion
  if (cand.edgeCleanup && cleanupMask) {
    const { strength, radius, maxPasses } = cand.edgeCleanup
    const dilated = new Uint8Array(mw * mh)
    for (let r = 0; r < mh; r++) {
      for (let c = 0; c < mw; c++) {
        if (!cleanupMask[r * mw + c]) continue
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nc = c + dc, nr = r + dr
            if (nc >= 0 && nc < mw && nr >= 0 && nr < mh) dilated[nr * mw + nc] = 1
          }
        }
      }
    }
    const active = new Uint8Array(dilated)
    for (let iter = 0; iter < maxPasses; iter++) {
      let changed = 0
      const next = new Uint8Array(active)
      for (let r = 0; r < mh; r++) {
        for (let c = 0; c < mw; c++) {
          if (!active[r * mw + c]) continue
          let cnt = 0
          const sum = [0, 0, 0]
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const nc = c + dc, nr = r + dr
              if (nc < 0 || nc >= mw || nr < 0 || nr >= mh || active[nr * mw + nc]) continue
              const ni = ((cand.y + nr) * width + cand.x + nc) * 4
              sum[0] += out[ni]; sum[1] += out[ni + 1]; sum[2] += out[ni + 2]
              cnt++
            }
          }
          if (cnt === 0) continue
          const idx = ((cand.y + r) * width + cand.x + c) * 4
          for (let ch = 0; ch < 3; ch++) {
            const avg = sum[ch] / cnt
            out[idx + ch] = Math.round(out[idx + ch] * (1 - strength) + avg * strength)
          }
          next[r * mw + c] = 0
          changed++
        }
      }
      active.set(next)
      if (changed === 0) break
    }
  }

  return new ImageData(out, width, imageData.height)
}

// ── Main entry ────────────────────────────────────────────────────────────────

/**
 * Remove the Gemini watermark from an MP4 video.
 *
 * @param arrayBuffer - Raw MP4 file data.
 * @param options - Processing options (progress callback).
 * @returns Blob of the cleaned MP4 video.
 */
export async function purifyVideo(
  arrayBuffer: ArrayBuffer,
  options: VideoProcessOptions = {},
): Promise<Blob> {
  const onProgress = options.onProgress

  if (typeof createFile !== 'function') throw new Error('MP4Box library not loaded')
  if (typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined') {
    throw new Error('WebCodecs not available in this browser')
  }

  report(onProgress, 'demux', 0)
  const { videoTrack, audioTrack, videoSamples, audioSamples, videoDescription } =
    await demuxMp4(arrayBuffer)
  report(onProgress, 'demux', 1)

  const width = videoTrack.video.width
  const height = videoTrack.video.height
  const dimKey = `${width}x${height}`

  if (!SUPPORTED_VIDEO_DIMS.has(dimKey)) {
    throw new Error(
      `Unsupported dimensions: ${width} × ${height}. ` +
      `Supported: 1280×720, 720×1280, 1920×1080, 1080×1920.`,
    )
  }

  const totalFrames = videoSamples.length || 1
  const timescale = videoSamples[0]?.timescale ?? videoTrack.timescale ?? 30000
  let avgDur = 0
  for (const s of videoSamples) avgDur += s.duration
  avgDur = avgDur / totalFrames || timescale / 30
  const fps = Math.max(1, Math.round(timescale / avgDur))

  console.log(`${TAG} Source: ${width}x${height}, ${totalFrames} frames, ~${fps}fps, codec ${videoTrack.codec}`)

  const is1080 = (width === 1920 && height === 1080) || (width === 1080 && height === 1920)

  // Load masks
  const maskSize = is1080 ? VIDEO_MASK_1080_SIZE : VIDEO_MASK_720_SIZE
  const maskB64 = is1080 ? VIDEO_MASK_1080_B64 : VIDEO_MASK_720_B64
  const alphaMapData = await loadAlphaMap(maskB64, maskSize, is1080)

  const offsets = is1080 ? OFFSETS_1080 : OFFSETS_720
  const candidates = offsets.map(off => ({
    x: clamp(width - off, 0, width - maskSize),
    y: clamp(height - off, 0, height - maskSize),
    alphaMap: alphaMapData,
    score: 0,
    baseStrength: 1,
  }))

  // Muxer setup
  const Mp4Muxer = await import('mp4-muxer')
  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
    video: { codec: 'avc', width, height },
    audio: audioTrack
      ? {
          codec: 'aac',
          sampleRate: audioTrack.audio.sample_rate,
          numberOfChannels: audioTrack.audio.channel_count,
        }
      : undefined,
  })

  // Encoder setup
  const durationSeconds = (avgDur * totalFrames) / timescale || totalFrames / fps
  let sourceBytes = 0
  for (const s of videoSamples) sourceBytes += (s.data?.byteLength ?? 0)
  const sourceBitrate = durationSeconds > 0 ? (sourceBytes * 8) / durationSeconds : 0
  const formulaBitrate = width * height * fps * BITRATE_FORMULA_FACTOR
  const encodeBitrate = Math.round(
    Math.max(BITRATE_MIN, Math.min(BITRATE_MAX, Math.max(formulaBitrate, sourceBitrate * 1.15))),
  )

  let encoderConfig: VideoEncoderConfig = {
    codec: 'avc1.640028',
    width,
    height,
    bitrate: encodeBitrate,
    bitrateMode: 'variable',
    framerate: fps,
    avc: { format: 'avc' },
  }
  let support = await VideoEncoder.isConfigSupported(encoderConfig)
  if (!support.supported) {
    encoderConfig = { ...encoderConfig, codec: 'avc1.42001f' }
    support = await VideoEncoder.isConfigSupported(encoderConfig)
    if (!support.supported) throw new Error('No supported H.264 encoder configuration')
  }

  let encodeError: any = null
  const encoder = new VideoEncoder({
    output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
    error: (e: any) => { encodeError = e; console.error(TAG, 'encoder error', e) },
  })
  encoder.configure(encoderConfig)

  // Calibrate on frame at ~15% — but must start from a key frame
  report(onProgress, 'analyze', 0)

  const targetIdx = Math.floor(0.15 * totalFrames)
  // Find the nearest key frame at or before the target
  let calStartIdx = targetIdx
  while (calStartIdx > 0 && !videoSamples[calStartIdx].is_sync) calStartIdx--

  const calSamples = videoSamples.slice(calStartIdx, targetIdx + 1)
  if (calSamples.length) {
    const decoder = new VideoDecoder({
      output: (frame: any) => {
        // Only score the last frame (the target), discard intermediate frames
        const cvs = new OffscreenCanvas(width, height)
        const ctx = cvs.getContext('2d', { willReadFrequently: true })!
        ctx.drawImage(frame, 0, 0, width, height)
        frame.close()
        const calData = ctx.getImageData(0, 0, width, height)

        for (const c of candidates) {
          c.score = pearsonNCC(calData.data, width, height, c.alphaMap.values, maskSize, c.x, c.y, {
            grayscale: 'average',
            alphaCutoff: 0.08,
          })
        }
      },
      error: (e: any) => console.error(TAG, 'calibration decode error', e),
    })

    decoder.configure({
      codec: videoTrack.codec,
      codedWidth: width,
      codedHeight: height,
      description: videoDescription || undefined,
    })

    // Feed from the key frame up to the target
    for (const s of calSamples) {
      decoder.decode(new EncodedVideoChunk({
        type: s.is_sync ? 'key' : 'delta',
        timestamp: (s.cts * 1e6) / s.timescale,
        duration: (s.duration * 1e6) / s.timescale,
        data: s.data,
      }))
    }
    await decoder.flush()
    decoder.close()
  }

  // Pick best candidate
  const best = candidates.reduce((a, b) => (b.score > a.score ? b : a))
  const tieMargin = 0.04
  const chosen = best.score >= candidates[0].score + tieMargin ? best : candidates[0]

  const calData = (() => {
    const cvs = new OffscreenCanvas(width, height)
    const ctx = cvs.getContext('2d', { willReadFrequently: true })!
    return { cvs, ctx }
  })()

  // Estimate opacity — decode from key frames for each sample
  const histogram: Record<number, number> = {}
  for (const op of OPACITY_LEVELS) histogram[op] = 0
  const sampleCount = Math.min(5, totalFrames)
  for (let fi = 0; fi < sampleCount; fi++) {
    const targetSampleIdx = Math.floor(fi * totalFrames / sampleCount)
    // Find nearest key frame at or before this index
    let startIdx = targetSampleIdx
    while (startIdx > 0 && !videoSamples[startIdx].is_sync) startIdx--
    const samples = videoSamples.slice(startIdx, targetSampleIdx + 1)
    if (!samples.length) continue

    const d = new VideoDecoder({
      output: (frame: any) => {
        calData.ctx.drawImage(frame, 0, 0, width, height)
        frame.close()
        const imgData = calData.ctx.getImageData(0, 0, width, height)
        const op = estimateOpacity(imgData, chosen)
        histogram[op] = (histogram[op] || 0) + 1
      },
      error: () => {},
    })
    d.configure({ codec: videoTrack.codec, codedWidth: width, codedHeight: height, description: videoDescription || undefined })
    for (const s of samples) {
      d.decode(new EncodedVideoChunk({
        type: s.is_sync ? 'key' : 'delta',
        timestamp: (s.cts * 1e6) / s.timescale,
        duration: (s.duration * 1e6) / s.timescale,
        data: s.data,
      }))
    }
    await d.flush()
    d.close()
  }

  let modalOpacity = OPACITY_LEVELS[0], modalCount = 0
  for (const [k, v] of Object.entries(histogram)) {
    if (v > modalCount) { modalCount = v; modalOpacity = parseFloat(k) }
  }
  chosen.opacity = modalOpacity
  if (modalOpacity >= 1 && !chosen.alphaMap.colorValues) {
    chosen.overlayValue = 255
    chosen.ceiling = 0.99
    chosen.edgeCleanup = { strength: EDGE_STRENGTH, radius: EDGE_RADIUS, maxPasses: EDGE_MAX_PASSES }
  }

  console.log(`${TAG} calibrated: pos=(${chosen.x},${chosen.y}) mask=${maskSize}px score=${chosen.score.toFixed(3)} opacity=${chosen.opacity}`)

  report(onProgress, 'analyze', 1)

  // Process frames
  const patchCanvas = new OffscreenCanvas(width, height)
  const patchCtx = patchCanvas.getContext('2d', { willReadFrequently: true })!
  let processed = 0
  const keyInterval = Math.max(1, fps * 2)

  let decodeError: any = null
  const decoder = new VideoDecoder({
    output: (frame: any) => {
      try {
        const tsMicro = frame.timestamp
        const durMicro = frame.duration
        patchCtx.drawImage(frame, 0, 0, width, height)
        frame.close()
        const imageData = patchCtx.getImageData(0, 0, width, height)
        const cleaned = inpaintFrame(imageData, { ...chosen, alphaMap: chosen.alphaMap as any })

        const init: any = {
          format: 'RGBA',
          codedWidth: width,
          codedHeight: height,
          timestamp: tsMicro,
        }
        if (durMicro != null) init.duration = durMicro
        const vf = new VideoFrame(cleaned.data.buffer, init)
        encoder.encode(vf, { keyFrame: processed % keyInterval === 0 })
        vf.close()
        processed++
        report(onProgress, 'process', processed / totalFrames)
      } catch (e) {
        decodeError = e
        console.error(TAG, 'frame patch error', e)
        try { frame.close() } catch (_) { /* already closed */ }
      }
    },
    error: (e: any) => { decodeError = e; console.error(TAG, 'decoder error', e) },
  })

  decoder.configure({
    codec: videoTrack.codec,
    codedWidth: width,
    codedHeight: height,
    description: videoDescription || undefined,
  })

  report(onProgress, 'process', 0)
  let framesDecoded = 0
  for (const s of videoSamples) {
    if (decodeError) throw decodeError
    decoder.decode(new EncodedVideoChunk({
      type: s.is_sync ? 'key' : 'delta',
      timestamp: (s.cts * 1e6) / s.timescale,
      duration: (s.duration * 1e6) / s.timescale,
      data: s.data,
    }))
    framesDecoded++
    if (framesDecoded % 24 === 0) await new Promise(r => setTimeout(r, 0))
  }

  await decoder.flush()
  await encoder.flush()
  if (decodeError) throw decodeError
  if (encodeError) throw encodeError
  decoder.close()
  encoder.close()

  // Copy audio verbatim
  if (audioTrack && audioSamples.length) {
    try {
      const sr = audioTrack.audio.sample_rate
      const ch = audioTrack.audio.channel_count
      let srIdx = AAC_SAMPLE_RATES.indexOf(sr)
      if (srIdx < 0) srIdx = 4
      const audioMeta = {
        decoderConfig: {
          codec: 'mp4a.40.2',
          sampleRate: sr,
          numberOfChannels: ch,
          description: new Uint8Array([
            (16 | (srIdx >> 1)) & 0xff,
            (((srIdx & 1) << 7) | (ch << 3)) & 0xff,
          ]),
        },
      }
      for (const s of audioSamples) {
        muxer.addAudioChunk(
          new EncodedAudioChunk({
            type: 'key',
            timestamp: (s.cts * 1e6) / s.timescale,
            duration: (s.duration * 1e6) / s.timescale,
            data: s.data,
          }),
          audioMeta,
        )
      }
      console.log(`${TAG} Copied ${audioSamples.length} audio samples`)
    } catch (e) {
      console.warn(`${TAG} Audio copy failed — output will be silent:`, e)
    }
  }

  report(onProgress, 'mux', 0.95)
  muxer.finalize()
  const blob = new Blob([(muxer.target as any).buffer], { type: 'video/mp4' })
  report(onProgress, 'done', 1)
  console.log(`${TAG} Done — output ${blob.size} bytes`)
  return blob
}
