/**
 * Shared utility functions used across image and video processors.
 *
 * All functions are pure — no side effects, no mutation.
 */

/**
 * Clamp a number between min and max (inclusive).
 *
 * @param v - Value to clamp.
 * @param lo - Lower bound.
 * @param hi - Upper bound.
 * @returns Clamped value.
 */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi)
}

/**
 * Extract per-pixel alpha from RGBA image data using the Gemini formula:
 *   alpha = max(R, G, B) / 255
 *
 * This works because on a pure black background:
 *   watermarked = alpha × 255 + (1 - alpha) × 0 = alpha × 255
 *   → alpha = pixel_value / 255
 *
 * @param data - Raw RGBA pixel data from ImageData.data.
 * @param pixelCount - Total number of pixels (width × height).
 * @returns Float32Array of alpha values, one per pixel.
 */
export function extractAlpha(data: Uint8ClampedArray, pixelCount: number): Float32Array {
  const alpha = new Float32Array(pixelCount)
  for (let i = 0; i < pixelCount; i++) {
    const t = i * 4
    alpha[i] = Math.max(data[t], data[t + 1], data[t + 2]) / 255
  }
  return alpha
}

/**
 * Format a byte count into a human-readable file size string.
 *
 * @param bytes - File size in bytes.
 * @returns Formatted string, e.g. "1.4 MB".
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Format a duration in milliseconds to a human-readable string.
 *
 * @param ms - Duration in milliseconds.
 * @returns Formatted string, e.g. "1.2s" or "450ms".
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Check if the browser supports the required video APIs.
 *
 * @returns Object with `supported` flag and optional `reason` string.
 */
export function checkVideoSupport(): { supported: boolean; reason?: string } {
  if (typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined') {
    return {
      supported: false,
      reason: 'WebCodecs API is not supported in this browser. Use Chrome, Edge, or Brave 94+.',
    }
  }
  return { supported: true }
}
