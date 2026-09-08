/**
 * Bilinear rescaling for alpha maps and colour maps.
 *
 * Single implementation shared by image and video processors.
 * Used to enlarge or shrink the calibrated watermark mask.
 */

/**
 * Bilinear rescale for a single-channel Float32Array (alpha map).
 *
 * @param values - Source alpha values (oldSize × oldSize).
 * @param oldSize - Source dimension.
 * @param newSize - Target dimension.
 * @returns Rescaled Float32Array (newSize × newSize).
 */
export function rescaleBilinear(
  values: Float32Array,
  oldSize: number,
  newSize: number,
): Float32Array {
  if (oldSize === newSize) return values

  const out = new Float32Array(newSize * newSize)
  const step = (oldSize - 1) / Math.max(1, newSize - 1)

  for (let y = 0; y < newSize; y++) {
    const sy = y * step
    const y0 = Math.floor(sy)
    const y1 = Math.min(oldSize - 1, y0 + 1)
    const fy = sy - y0

    for (let x = 0; x < newSize; x++) {
      const sx = x * step
      const x0 = Math.floor(sx)
      const x1 = Math.min(oldSize - 1, x0 + 1)
      const fx = sx - x0

      const a00 = values[y0 * oldSize + x0]
      const a10 = values[y0 * oldSize + x1]
      const a01 = values[y1 * oldSize + x0]
      const a11 = values[y1 * oldSize + x1]

      out[y * newSize + x] =
        a00 * (1 - fx) * (1 - fy) +
        a10 * fx * (1 - fy) +
        a01 * (1 - fx) * fy +
        a11 * fx * fy
    }
  }

  return out
}

/**
 * Bilinear rescale for a 3-channel Float32Array (RGB colour map).
 *
 * @param values - Source colour values (oldSize × oldSize × 3).
 * @param oldSize - Source dimension.
 * @param newSize - Target dimension.
 * @returns Rescaled Float32Array (newSize × newSize × 3).
 */
export function rescaleColor(
  values: Float32Array,
  oldSize: number,
  newSize: number,
): Float32Array {
  if (oldSize === newSize) return values

  const out = new Float32Array(newSize * newSize * 3)
  const step = (oldSize - 1) / Math.max(1, newSize - 1)

  for (let y = 0; y < newSize; y++) {
    const sy = y * step
    const y0 = Math.floor(sy)
    const y1 = Math.min(oldSize - 1, y0 + 1)
    const fy = sy - y0

    for (let x = 0; x < newSize; x++) {
      const sx = x * step
      const x0 = Math.floor(sx)
      const x1 = Math.min(oldSize - 1, x0 + 1)
      const fx = sx - x0

      for (let ch = 0; ch < 3; ch++) {
        const a00 = values[(y0 * oldSize + x0) * 3 + ch]
        const a10 = values[(y0 * oldSize + x1) * 3 + ch]
        const a01 = values[(y1 * oldSize + x0) * 3 + ch]
        const a11 = values[(y1 * oldSize + x1) * 3 + ch]

        out[(y * newSize + x) * 3 + ch] =
          a00 * (1 - fx) * (1 - fy) +
          a10 * fx * (1 - fy) +
          a01 * (1 - fx) * fy +
          a11 * fx * fy
      }
    }
  }

  return out
}
