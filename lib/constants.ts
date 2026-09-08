/**
 * Shared thresholds and configuration constants.
 *
 * All magic numbers live here — never hardcoded in processors.
 * Values are ported from Erasio's calibrated defaults.
 */

// ── Alpha blend thresholds ────────────────────────────────────────────────────
/** Minimum alpha value to apply reverse blend. Below this, pixel is untouched. */
export const ALPHA_THRESHOLD = 0.002

/** Maximum alpha value before clamping. Prevents division blow-up. */
export const MAX_ALPHA = 0.99

/** Expected watermark colour (white sparkle on Gemini). */
export const LOGO_VALUE = 255

// ── NCC detection thresholds ──────────────────────────────────────────────────
/** NCC at or above this → trust auto-margin position, skip scan. */
export const NCC_GOOD = 0.5

/** Minimum NCC to declare a watermark detected. */
export const NCC_ACCEPT = 0.3

// ── Scan parameters ───────────────────────────────────────────────────────────
/** Coarse scan step size in pixels. */
export const SCAN_STRIDE = 8

/** ± pixels to refine after coarse scan peak. */
export const REFINE_RADIUS = 8

// ── Gain / opacity ────────────────────────────────────────────────────────────
/**
 * Gain multiplier when the detected position drifts from the standard
 * bottom-right margin (newer/Weaker Gemini variant).
 */
export const GAIN_DRIFT = 0.62

/** Supported opacity levels for video calibration. */
export const OPACITY_LEVELS: readonly number[] = [1, 0.62]

// ── Mask scale ────────────────────────────────────────────────────────────────
export const MASK_SCALE_MIN = 0.5
export const MASK_SCALE_MAX = 3.0

// ── Image watermark sizing ────────────────────────────────────────────────────
/**
 * Gemini sizing rules:
 *   width > 1024 AND height > 1024 → 96×96 mask, 64px margin
 *   otherwise                      → 48×48 mask, 32px margin
 */
export const IMAGE_LARGE_THRESHOLD = 1024
export const IMAGE_MASK_48_SIZE = 48
export const IMAGE_MASK_96_SIZE = 96
export const IMAGE_MARGIN_SMALL = 32
export const IMAGE_MARGIN_LARGE = 64

// ── Video watermark sizing ────────────────────────────────────────────────────
export const VIDEO_MASK_720_SIZE = 48
export const VIDEO_MASK_1080_SIZE = 84

/** Offsets from bottom-right corner for 720p candidates. */
export const OFFSETS_720: readonly number[] = [144, 120, 128, 72]

/** Offsets from bottom-right corner for 1080p candidates. */
export const OFFSETS_1080: readonly number[] = [222, 186]

// ── Supported video dimensions ────────────────────────────────────────────────
export const SUPPORTED_VIDEO_DIMS = new Set([
  '1280x720',
  '720x1280',
  '1920x1080',
  '1080x1920',
])

// ── Edge diffusion (video only) ───────────────────────────────────────────────
export const EDGE_STRENGTH = 0.6
export const EDGE_RADIUS = 2
export const EDGE_MAX_PASSES = 120

// ── AAC audio sample rates ────────────────────────────────────────────────────
export const AAC_SAMPLE_RATES: readonly number[] = [
  96000, 88200, 64000, 48000, 44100, 32000, 24000,
  22050, 16000, 12000, 11025, 8000, 7350,
]

// ── Bitrate ───────────────────────────────────────────────────────────────────
export const BITRATE_MIN = 2_000_000
export const BITRATE_MAX = 40_000_000
export const BITRATE_FORMULA_FACTOR = 0.12
