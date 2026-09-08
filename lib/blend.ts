/**
 * Reverse alpha blending and edge diffusion for watermark removal.
 *
 * Single implementation shared by image and video processors.
 */

import { clamp } from './utils'
import { ALPHA_THRESHOLD, MAX_ALPHA, EDGE_STRENGTH, EDGE_RADIUS, EDGE_MAX_PASSES } from './constants'

/** Options controlling the reverse blend. */
export interface BlendOptions {
  /** Expected watermark colour (0-255). @default 255 */
  logoValue?: number
  /** Minimum alpha to apply blend. @default ALPHA_THRESHOLD */
  alphaThreshold?: number
  /** Maximum alpha cap. @default MAX_ALPHA */
  maxAlpha?: number
  /** Gain multiplier applied to alpha (e.g. 0.62 for drifted video positions). @default 1 */
  gain?: number
}

/** Options controlling edge diffusion. */
export interface EdgeOptions {
  /** Blend strength per pass (0-1). @default EDGE_STRENGTH */
  strength?: number
  /** Radius of the neighbourhood to average. @default EDGE_RADIUS */
  radius?: number
  /** Maximum diffusion passes. @default EDGE_MAX_PASSES */
  maxPasses?: number
}

/**
 * Apply reverse alpha blend to an ImageData in place.
 *
 * Formula: original = (pixel - α × logoValue) / (1 - α)
 *
 * @param imageData - ImageData to modify in place.
 * @param alphaMap - Float32Array of alpha values (mapSize × mapSize).
 * @param mapSize - Dimension of the alpha map.
 * @param x - Top-left x of the watermark region.
 * @param y - Top-left y of the watermark region.
 * @param options - Blend tuning options.
 * @returns Number of pixels modified.
 */
export function reverseBlend(
  imageData: ImageData,
  alphaMap: Float32Array,
  mapSize: number,
  x: number,
  y: number,
  options: BlendOptions = {},
): number {
  const {
    logoValue = 255,
    alphaThreshold = ALPHA_THRESHOLD,
    maxAlpha = MAX_ALPHA,
    gain = 1,
  } = options

  const { width, data } = imageData
  const x1 = Math.max(0, x)
  const y1 = Math.max(0, y)
  const x2 = Math.min(width, x + mapSize)
  const y2 = Math.min(imageData.height, y + mapSize)
  let modified = 0

  for (let row = y1; row < y2; row++) {
    for (let col = x1; col < x2; col++) {
      const ar = row - y
      const ac = col - x
      if (ar < 0 || ar >= mapSize || ac < 0 || ac >= mapSize) continue

      let alpha = alphaMap[ar * mapSize + ac] * gain
      if (alpha < alphaThreshold) continue
      alpha = Math.min(alpha, maxAlpha)

      const oneMinusAlpha = 1 - alpha
      if (oneMinusAlpha <= 1e-4) continue

      const idx = (row * width + col) * 4
      for (let c = 0; c < 3; c++) {
        const original = (data[idx + c] - alpha * logoValue) / oneMinusAlpha
        data[idx + c] = Math.round(clamp(original, 0, 255))
      }
      modified++
    }
  }

  return modified
}

/**
 * Iterative edge diffusion to smooth the boundary between cleaned
 * and uncleaned pixels (video only).
 *
 * @param imageData - ImageData to modify in place.
 * @param cleanMask - Uint8Array mask marking cleaned pixels (mapSize × mapSize).
 * @param mapSize - Dimension of the mask.
 * @param x - Top-left x of the watermark region.
 * @param y - Top-left y of the watermark region.
 * @param options - Edge diffusion tuning.
 * @returns The cleaned mask (modified in place, all zeros when done).
 */
export function edgeDiffuse(
  imageData: ImageData,
  cleanMask: Uint8Array,
  mapSize: number,
  x: number,
  y: number,
  options: EdgeOptions = {},
): Uint8Array {
  const {
    strength = EDGE_STRENGTH,
    radius = EDGE_RADIUS,
    maxPasses = EDGE_MAX_PASSES,
  } = options

  const { width, data } = imageData

  // Dilate the mask by the radius
  const dilated = new Uint8Array(mapSize * mapSize)
  for (let r = 0; r < mapSize; r++) {
    for (let c = 0; c < mapSize; c++) {
      if (!cleanMask[r * mapSize + c]) continue
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          const nc = c + dc
          const nr = r + dr
          if (nc >= 0 && nc < mapSize && nr >= 0 && nr < mapSize) {
            dilated[nr * mapSize + nc] = 1
          }
        }
      }
    }
  }

  // Iterative diffusion
  const active = new Uint8Array(dilated)
  for (let iter = 0; iter < maxPasses; iter++) {
    let changed = 0
    const next = new Uint8Array(active)

    for (let r = 0; r < mapSize; r++) {
      for (let c = 0; c < mapSize; c++) {
        if (!active[r * mapSize + c]) continue

        let cnt = 0
        const sum = [0, 0, 0]

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nc = c + dc
            const nr = r + dr
            if (nc < 0 || nc >= mapSize || nr < 0 || nr >= mapSize) continue
            if (active[nr * mapSize + nc]) continue

            const ni = ((y + nr) * width + (x + nc)) * 4
            sum[0] += data[ni]
            sum[1] += data[ni + 1]
            sum[2] += data[ni + 2]
            cnt++
          }
        }

        if (cnt === 0) continue

        const idx = ((y + r) * width + (x + c)) * 4
        for (let ch = 0; ch < 3; ch++) {
          const avg = sum[ch] / cnt
          data[idx + ch] = Math.round(data[idx + ch] * (1 - strength) + avg * strength)
        }

        next[r * mapSize + c] = 0
        changed++
      }
    }

    active.set(next)
    if (changed === 0) break
  }

  return active
}
