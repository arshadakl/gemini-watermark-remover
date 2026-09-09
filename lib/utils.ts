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
 * Decode a base64-encoded PNG into raw RGBA pixels at a target size.
 *
 * Uses `createImageBitmap` + `OffscreenCanvas` when available (fast and
 * worker-safe), otherwise falls back to `HTMLImageElement` + a plain canvas
 * so image processing keeps working on Safari < 16.4 and older mobile
 * browsers that lack `OffscreenCanvas.getContext('2d')`.
 *
 * @param b64 - Base64-encoded PNG string.
 * @param size - Target width/height in pixels.
 * @returns Uint8ClampedArray of RGBA values (size × size × 4).
 */
export async function decodePngToRgba(b64: string, size: number): Promise<Uint8ClampedArray> {
  const raw = atob(b64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)

  const blob = new Blob([bytes], { type: 'image/png' })

  if (typeof createImageBitmap === 'function' && typeof OffscreenCanvas === 'function') {
    try {
      const bmp = await createImageBitmap(blob)
      const cvs = new OffscreenCanvas(size, size)
      const ctx = cvs.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(bmp, 0, 0, size, size)
        const px = ctx.getImageData(0, 0, size, size).data
        bmp.close()
        return px
      }
      bmp.close()
    } catch {
      // Fall through to the canvas path below.
    }
  }

  const img = new Image()
  const url = URL.createObjectURL(blob)
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to decode mask image'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }

  const cvs = document.createElement('canvas')
  cvs.width = size
  cvs.height = size
  const ctx = cvs.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(img, 0, 0, size, size)
  return ctx.getImageData(0, 0, size, size).data
}

/**
 * Convert a canvas to a Blob, preserving the source image format where
 * possible so a JPEG/WebP source doesn't balloon into a huge PNG.
 *
 * @param canvas - Source canvas.
 * @param preferredType - Preferred MIME type (e.g. from file.type).
 * @returns A Blob in the requested (or a supported fallback) format.
 */
export function canvasToBlob(canvas: HTMLCanvasElement, preferredType?: string): Promise<Blob> {
  // Browsers can only encode PNG/JPEG/WebP. GIF (and other exotic types in the
  // accept list) must fall back to a supported format or toBlob returns null.
  const SUPPORTED = new Set(['image/png', 'image/jpeg', 'image/webp'])
  const candidates = [preferredType, 'image/webp', 'image/jpeg', 'image/png']
    .filter((t): t is string => !!t && SUPPORTED.has(t))
  const type = candidates[0] || 'image/png'

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      type,
      0.92,
    )
  })
}

/**
 * Check if the browser supports the required video APIs.
 * SSR-safe: returns a neutral result when called outside the browser.
 *
 * @returns Object with `supported` flag and optional `reason` string.
 */
export function checkVideoSupport(): { supported: boolean; reason?: string } {
  if (typeof window === 'undefined' || typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined') {
    return {
      supported: false,
      reason: 'WebCodecs API is not supported in this browser. Use Chrome, Edge, or Brave 94+.',
    }
  }
  return { supported: true }
}
