/**
 * Normalized Cross-Correlation (NCC) scoring for watermark detection.
 *
 * Single implementation shared by image and video processors.
 * Computes Pearson correlation between an alpha-map pattern and
 * the grayscale of a candidate image region.
 */

import { clamp } from './utils'

/** Options for the NCC scorer. */
export interface NccOptions {
  /**
   * Grayscale conversion formula.
   * - `'bt601'`: perceptual (0.299R + 0.587G + 0.114B) — used for images.
   * - `'average'`: simple (R + G + B) / 3 — used for video.
   * @default 'bt601'
   */
  grayscale?: 'bt601' | 'average'
  /**
   * Minimum alpha value to include a pixel in scoring.
   * Pixels with alpha <= this are skipped.
   * @default 0
   */
  alphaCutoff?: number
  /**
   * Value to return when the region is out of bounds or has zero variance.
   * @default -1
   */
  fallbackValue?: number
}

/**
 * Compute Pearson NCC between an alpha-map and the grayscale of an image
 * region at position (x, y).
 *
 * @param data - Raw RGBA pixel data from ImageData.data.
 * @param width - Image width in pixels.
 * @param height - Image height in pixels.
 * @param alphaMap - Float32Array of alpha values (size × size).
 * @param mapSize - Dimension of the alpha map (assumed square).
 * @param x - Top-left x of the candidate region.
 * @param y - Top-left y of the candidate region.
 * @param options - Scoring options.
 * @returns NCC score, or the fallback value if invalid.
 */
export function pearsonNCC(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  alphaMap: Float32Array,
  mapSize: number,
  x: number,
  y: number,
  options: NccOptions = {},
): number {
  const {
    grayscale = 'bt601',
    alphaCutoff = 0,
    fallbackValue = -1,
  } = options

  // Bounds check
  if (x < 0 || y < 0 || x + mapSize > width || y + mapSize > height) {
    return fallbackValue
  }

  let sP = 0 // sum(alpha × gray)
  let sA = 0 // sum(alpha)
  let sA2 = 0 // sum(alpha²)
  let sG = 0 // sum(gray)
  let sG2 = 0 // sum(gray²)
  let n = 0

  for (let row = 0; row < mapSize; row++) {
    const imgRow = (y + row) * width
    const aRow = row * mapSize

    for (let col = 0; col < mapSize; col++) {
      const a = alphaMap[aRow + col]
      if (a <= alphaCutoff) continue

      const i = (imgRow + (x + col)) * 4
      const gray =
        grayscale === 'bt601'
          ? (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
          : (data[i] + data[i + 1] + data[i + 2]) / 765

      sP += a * gray
      sA += a
      sA2 += a * a
      sG += gray
      sG2 += gray * gray
      n++
    }
  }

  if (n === 0) return fallbackValue

  const mA = sA / n
  const mG = sG / n
  const denomA = Math.sqrt(Math.max(0, sA2 / n - mA * mA))
  const denomG = Math.sqrt(Math.max(0, sG2 / n - mG * mG))

  if (denomA < 1e-3 || denomG < 1e-3) return fallbackValue

  return (sP / n - mA * mG) / (denomA * denomG)
}

/**
 * Coarse-then-fine NCC scan of the bottom-right quadrant.
 *
 * Scans at `stride` intervals, then refines ±refineRadius at stride 1
 * around the best coarse peak.
 *
 * @param data - Raw RGBA pixel data.
 * @param width - Image width.
 * @param height - Image height.
 * @param alphaMap - Alpha map to scan with.
 * @param mapSize - Dimension of the alpha map.
 * @param stride - Coarse scan step size.
 * @param refineRadius - ± pixels to refine after coarse peak.
 * @param nccOptions - Options forwarded to pearsonNCC.
 * @returns Best { x, y, ncc } found.
 */
export function scanBottomRight(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  alphaMap: Float32Array,
  mapSize: number,
  stride: number,
  refineRadius: number,
  nccOptions: NccOptions = {},
): { x: number; y: number; ncc: number } {
  const xStart = Math.max(0, Math.floor(width * 0.5))
  const yStart = Math.max(0, Math.floor(height * 0.5))
  const xEnd = width - mapSize
  const yEnd = height - mapSize

  if (xEnd < xStart || yEnd < yStart) {
    return { x: -1, y: -1, ncc: -1 }
  }

  let best = { x: xStart, y: yStart, ncc: -1 }

  // Coarse pass
  for (let sy = yStart; sy <= yEnd; sy += stride) {
    for (let sx = xStart; sx <= xEnd; sx += stride) {
      const v = pearsonNCC(data, width, height, alphaMap, mapSize, sx, sy, nccOptions)
      if (v > best.ncc) best = { x: sx, y: sy, ncc: v }
    }
  }

  // Fine refinement
  if (refineRadius > 0 && best.ncc > -1) {
    const rxLo = clamp(best.x - refineRadius, 0, xEnd)
    const ryLo = clamp(best.y - refineRadius, 0, yEnd)
    const rxHi = clamp(best.x + refineRadius, 0, xEnd)
    const ryHi = clamp(best.y + refineRadius, 0, yEnd)

    for (let ry = ryLo; ry <= ryHi; ry++) {
      for (let rx = rxLo; rx <= rxHi; rx++) {
        const v = pearsonNCC(data, width, height, alphaMap, mapSize, rx, ry, nccOptions)
        if (v > best.ncc) best = { x: rx, y: ry, ncc: v }
      }
    }
  }

  return best
}
