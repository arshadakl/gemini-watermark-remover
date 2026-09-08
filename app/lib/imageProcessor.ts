/**
 * Image watermark removal processor.
 *
 * Thin orchestrator that composes the shared NCC, blend, and rescale modules.
 * Removes the visible Gemini Sparkle watermark from images using reverse
 * alpha blending.
 */

import type { ImageProcessOptions, ImageProcessResult, WatermarkDetection } from './types'
import {
  NCC_GOOD,
  NCC_ACCEPT,
  SCAN_STRIDE,
  REFINE_RADIUS,
  GAIN_DRIFT,
  IMAGE_LARGE_THRESHOLD,
  IMAGE_MASK_48_SIZE,
  IMAGE_MASK_96_SIZE,
  IMAGE_MARGIN_SMALL,
  IMAGE_MARGIN_LARGE,
  MASK_SCALE_MIN,
  MASK_SCALE_MAX,
} from './constants'
import { pearsonNCC, scanBottomRight } from './ncc'
import { rescaleBilinear } from './rescale'
import { reverseBlend } from './blend'
import { IMAGE_MASK_48_B64, IMAGE_MASK_96_B64, decodeImageMask } from './imageMasks'

const TAG = '[ImageProcessor]'

/** Cached decoded masks keyed by 'old'|'new' × size. */
const maskCache = new Map<string, Float32Array>()

async function getMask(b64: string, size: number, key: string): Promise<Float32Array> {
  const cached = maskCache.get(key)
  if (cached) return cached
  const decoded = await decodeImageMask(b64, size)
  maskCache.set(key, decoded)
  return decoded
}

/**
 * Determine mask size and position based on image dimensions.
 *
 * @param width - Image width.
 * @param height - Image height.
 * @returns Mask size, margin, and auto position.
 */
function getWatermarkConfig(width: number, height: number) {
  const isLarge = width > IMAGE_LARGE_THRESHOLD && height > IMAGE_LARGE_THRESHOLD
  const maskSize = isLarge ? IMAGE_MASK_96_SIZE : IMAGE_MASK_48_SIZE
  const margin = isLarge ? IMAGE_MARGIN_LARGE : IMAGE_MARGIN_SMALL
  return {
    maskSize,
    margin,
    autoX: width - margin - maskSize,
    autoY: height - margin - maskSize,
  }
}

/**
 * Remove the Gemini watermark from an ImageData.
 *
 * @param imageData - Source ImageData (modified in place).
 * @param options - Tuning options.
 * @returns Processing result with detection info and stats.
 */
export async function purifyImage(
  imageData: ImageData,
  options: ImageProcessOptions = {},
): Promise<ImageProcessResult> {
  const t0 = performance.now()
  const { width, height, data } = imageData

  // Resolve options with defaults
  const nccGood = options.nccGood ?? NCC_GOOD
  const nccAccept = options.nccAccept ?? NCC_ACCEPT
  const scanStride = options.scanStride ?? SCAN_STRIDE
  const refineRadius = options.refineRadius ?? REFINE_RADIUS
  const gainDrift = options.gainDrift ?? GAIN_DRIFT
  const maskScale = Math.min(MASK_SCALE_MAX, Math.max(MASK_SCALE_MIN, options.maskScale ?? 1))

  // Load masks
  const mask48 = await getMask(IMAGE_MASK_48_B64, IMAGE_MASK_48_SIZE, 'old_48')
  const mask96 = await getMask(IMAGE_MASK_96_B64, IMAGE_MASK_96_SIZE, 'old_96')

  const sizes = [
    { size: IMAGE_MASK_96_SIZE, margin: IMAGE_MARGIN_LARGE, alphaMap: mask96 },
    { size: IMAGE_MASK_48_SIZE, margin: IMAGE_MARGIN_SMALL, alphaMap: mask48 },
  ]

  let best: {
    size: number
    alphaMap: Float32Array
    x: number
    y: number
    ncc: number
    autoX: number
    autoY: number
    method: 'auto' | 'scan' | 'forced'
  } | null = null

  // Forced position path
  if (options.forcePosition) {
    const fp = options.forcePosition
    const inferSize = fp.size ?? (width > IMAGE_LARGE_THRESHOLD && height > IMAGE_LARGE_THRESHOLD ? 96 : 48)
    const cfg = sizes.find(s => s.size === inferSize) || sizes[1]
    const cx = Math.max(0, Math.min(width - cfg.size, Math.round(fp.x)))
    const cy = Math.max(0, Math.min(height - cfg.size, Math.round(fp.y)))
    const ncc = pearsonNCC(data, width, height, cfg.alphaMap, cfg.size, cx, cy, {
      grayscale: 'bt601',
    })
    best = {
      size: cfg.size,
      alphaMap: cfg.alphaMap,
      x: cx,
      y: cy,
      ncc: Math.max(ncc, nccAccept),
      autoX: width - cfg.margin - cfg.size,
      autoY: height - cfg.margin - cfg.size,
      method: 'forced',
    }
  } else {
    // Auto-detection path
    for (const cfg of sizes) {
      const autoX = width - cfg.margin - cfg.size
      const autoY = height - cfg.margin - cfg.size
      const autoNCC = pearsonNCC(data, width, height, cfg.alphaMap, cfg.size, autoX, autoY, {
        grayscale: 'bt601',
      })

      let entry = {
        size: cfg.size,
        alphaMap: cfg.alphaMap,
        x: autoX,
        y: autoY,
        ncc: autoNCC,
        autoX,
        autoY,
        method: 'auto' as const,
      }

      if (autoNCC < nccGood) {
        const scan = scanBottomRight(
          data,
          width,
          height,
          cfg.alphaMap,
          cfg.size,
          scanStride,
          refineRadius,
          { grayscale: 'bt601' },
        )
        if (scan.ncc > autoNCC) {
          entry = {
            size: cfg.size,
            alphaMap: cfg.alphaMap,
            x: scan.x,
            y: scan.y,
            ncc: scan.ncc,
            autoX,
            autoY,
            method: 'scan',
          }
        }
      }

      if (!best || entry.ncc > best.ncc) best = entry
    }
  }

  if (!best) {
    return {
      imageData,
      removed: false,
      pixelsModified: 0,
      elapsedMs: performance.now() - t0,
    }
  }

  const t1 = performance.now()
  const drifted = best.x !== best.autoX || best.y !== best.autoY
  const effectiveGain = drifted ? gainDrift : 1

  console.log(
    `${TAG} detect: size=${best.size}×${best.size} pos=(${best.x},${best.y}) ` +
    `method=${best.method} ncc=${best.ncc.toFixed(3)} gain=${effectiveGain.toFixed(2)}${drifted ? ' (drift)' : ''} ` +
    `(${(t1 - t0).toFixed(0)}ms) img=${width}×${height}`,
  )

  if (best.ncc < nccAccept) {
    return {
      imageData,
      removed: false,
      pixelsModified: 0,
      elapsedMs: performance.now() - t0,
    }
  }

  // Scale mask for cleanup
  const cleanSize = Math.max(8, Math.round(best.size * maskScale))
  const cleanAlphaMap = maskScale !== 1
    ? rescaleBilinear(best.alphaMap, best.size, cleanSize)
    : best.alphaMap
  const shift = best.method === 'forced' ? 0 : Math.floor((cleanSize - best.size) / 2)
  const cleanX = best.x - shift
  const cleanY = best.y - shift

  // Apply reverse blend
  const pixelsModified = reverseBlend(imageData, cleanAlphaMap, cleanSize, cleanX, cleanY, {
    gain: effectiveGain,
  })

  const detection: WatermarkDetection = {
    detected: true,
    ncc: best.ncc,
    position: { x: cleanX, y: cleanY, size: cleanSize },
    maskSize: best.size,
    method: best.method,
    drifted,
  }

  return {
    imageData,
    removed: pixelsModified > 0,
    detection,
    pixelsModified,
    elapsedMs: performance.now() - t0,
  }
}
