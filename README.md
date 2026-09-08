# Gemini Watermark Remover

Remove the visible Gemini AI sparkle watermark from images and videos — entirely in your browser. No server, no upload, no backend.

## Features

- **Image watermark removal** — any browser with Canvas support
- **Video watermark removal** — Chrome, Edge, or Brave 94+ (WebCodecs API)
- **100% client-side** — no files leave your device
- **Supported resolutions** — 1280×720, 720×1280, 1920×1080, 1080×1920 (video)
- **Audio preserved** — original audio track copied bit-for-bit

## Tech Stack

- [Nuxt 3](https://nuxt.com) (SPA mode)
- [Tailwind CSS](https://tailwindcss.com)
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) (video decode/encode)
- [mp4box.js](https://github.com/gpac/mp4box.js) (MP4 demux)
- [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) (MP4 mux)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
# → http://localhost:3000
```

## Build for Production

```bash
npm run generate
# Output: .output/public/
```

## Deploy to Cloudflare Pages

1. Push to GitHub
2. Cloudflare Dashboard → Pages → Create project
3. Build command: `npx nuxi generate`
4. Build output directory: `.output/public`

## Project Structure

```
app/
├── lib/                    # Core processing logic (framework-agnostic)
│   ├── types.ts            # Shared TypeScript interfaces
│   ├── constants.ts        # All thresholds and configuration
│   ├── utils.ts            # clamp, formatFileSize, etc.
│   ├── ncc.ts              # NCC scoring (Pearson correlation)
│   ├── rescale.ts          # Bilinear rescale for alpha maps
│   ├── blend.ts            # Reverse alpha blend + edge diffusion
│   ├── imageMasks.ts       # Embedded 48×48 and 96×96 alpha masks
│   ├── videoMasks.ts       # Embedded 48×48 and 84×84 video masks
│   ├── imageProcessor.ts   # Image watermark removal pipeline
│   └── videoProcessor.ts   # Video watermark removal pipeline
├── composables/            # Vue reactive wrappers
│   ├── useImageProcessor.ts
│   └── useVideoProcessor.ts
├── components/             # Reusable UI components
│   ├── FileUploader.vue
│   ├── ProcessingStatus.vue
│   └── DownloadButton.vue
└── pages/
    └── index.vue           # Main page
```

## How It Works

### Image Processing

1. Load calibrated alpha masks (48×48 or 96×96)
2. Detect watermark position via NCC (Normalized Cross-Correlation)
3. Reverse alpha blend: `original = (pixel - α × 255) / (1 - α)`
4. Output cleaned image

### Video Processing

1. Demux MP4 → video samples + audio samples (mp4box.js)
2. Decode a calibration frame at ~15% to detect watermark position
3. For each frame: decode (WebCodecs) → reverse blend → re-encode (WebCodecs)
4. Mux new video + original audio → MP4 (mp4-muxer)

## License

MIT
