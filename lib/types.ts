/** Pixel region where the watermark sits. */
export interface WatermarkRegion {
  x: number
  y: number
  size: number
}

/** Result returned by the NCC detection step. */
export interface WatermarkDetection {
  /** Whether a watermark was confidently detected. */
  detected: boolean
  /** Pearson NCC score (−1 … 1). */
  ncc: number
  /** Position of the detected stamp. */
  position: WatermarkRegion
  /** Which mask size was used (48 or 96 for images, 48 or 84 for video). */
  maskSize: number
  /** Detection method: auto-margin, scan, or forced. */
  method: 'auto' | 'scan' | 'forced'
  /** Whether the detected position drifted from the standard bottom-right margin. */
  drifted: boolean
}

/** Options that control image watermark removal. */
export interface ImageProcessOptions {
  /** Override NCC good threshold (default from constants). */
  nccGood?: number
  /** Override NCC accept threshold (default from constants). */
  nccAccept?: number
  /** Override scan stride (default from constants). */
  scanStride?: number
  /** Override refine radius (default from constants). */
  refineRadius?: number
  /** Override gain drift factor (default from constants). */
  gainDrift?: number
  /** Override alpha threshold (default from constants). */
  alphaThreshold?: number
  /** Override max alpha (default from constants). */
  maxAlpha?: number
  /** Override logo value — expected watermark colour (0-255). */
  logoValue?: number
  /** Mask scale factor (0.5–3.0). */
  maskScale?: number
  /** Force a specific position, bypassing detection. */
  forcePosition?: { x: number; y: number; size?: number }
}

/** Options that control video watermark removal. */
export interface VideoProcessOptions {
  /** Progress callback invoked with stage + ratio. */
  onProgress?: (progress: ProgressState) => void
}

/** Progress reported during processing. */
export interface ProgressState {
  /** Current pipeline stage. */
  stage: 'demux' | 'analyze' | 'process' | 'mux' | 'done'
  /** Normalised ratio 0–1 for the current stage. */
  ratio: number
}

/** Return type of `purifyImage`. */
export interface ImageProcessResult {
  /** The cleaned ImageData (modified in place). */
  imageData: ImageData
  /** Whether the watermark was detected and removed. */
  removed: boolean
  /** Detection details. */
  detection?: WatermarkDetection
  /** Number of pixels modified. */
  pixelsModified: number
  /** Processing time in milliseconds. */
  elapsedMs: number
}

/** Supported video dimensions. */
export type VideoDimension = '1280x720' | '720x1280' | '1920x1080' | '1080x1920'

/** Application processing mode. */
export type ProcessingMode = 'image' | 'video'
