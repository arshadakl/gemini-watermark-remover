<script setup lang="ts">
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

useSeoMeta({
  title: 'How Gemini Watermark Removal Works — Reverse Alpha Blending Explained',
  description:
    'A technical walkthrough of how the Gemini watermark is applied and how reverse alpha blending removes it losslessly. No AI inpainting, no server, all in the browser.',
  ogTitle: 'How Gemini Watermark Removal Works',
  ogDescription: 'Reverse alpha blending explained: the exact math behind removing the Gemini sparkle.',
  ogImage: `${siteUrl}/og/how-it-works.svg`,
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a]">
    <SiteNav />
    <div class="h-16" />

    <section class="relative overflow-hidden pt-12 pb-12">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
      <div class="relative mx-auto max-w-3xl px-6 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
          Technical walkthrough
        </div>
        <h1 class="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          How it <span class="text-brand-400">works</span>
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-gray-400">
          A deep dive into the math behind removing the Gemini watermark, why the result is lossless, and why most other tools produce smeared edges.
        </p>
      </div>
    </section>

    <article class="py-12">
      <div class="mx-auto max-w-3xl px-6">
        <h2 class="mb-4 text-2xl font-bold">Step 1 — How Gemini applies the watermark</h2>
        <p class="mb-4 leading-relaxed text-gray-400">
          Every AI-generated image and video from Google goes through a single watermarking pipeline. After the model produces the final pixels, Google stamps the four-point sparkle on top using standard alpha compositing:
        </p>
        <div class="mb-6 overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <code class="block font-mono text-sm text-brand-400">watermarked = α × logo + (1 − α) × original</code>
        </div>
        <p class="mb-8 leading-relaxed text-gray-400">
          The logo itself is a fixed 48×48 or 96×96 RGBA sprite. The alpha map (how transparent the logo is at every pixel) is also fixed — same calibration for every Gemini export. The logo is positioned in the bottom-right corner of the image, at a deterministic offset from the edge.
        </p>

        <h2 class="mb-4 text-2xl font-bold">Step 2 — Reversing the blend</h2>
        <p class="mb-4 leading-relaxed text-gray-400">
          Because the alpha map is known and the watermarked pixel values are observable, the original pixel values can be recovered exactly:
        </p>
        <div class="mb-6 overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <code class="block font-mono text-sm text-brand-400">original = (watermarked − α × 255) / (1 − α)</code>
        </div>
        <p class="mb-4 leading-relaxed text-gray-400">
          This is not AI. It is not inpainting. It is not a guess. It is the algebraic inverse of the operation Google performed. For every pixel under the watermark, the original RGB value is uniquely determined by the watermarked value and the alpha. Outside the watermark zone, every pixel is byte-identical to the source.
        </p>
        <p class="mb-8 leading-relaxed text-gray-400">
          The math fails only when α = 1 (the logo is fully opaque, so the original is fully masked). That happens in the very brightest center of the sparkle — a few pixels — and an edge-diffusion step fills those in by sampling nearby recovered pixels.
        </p>

        <h2 class="mb-4 text-2xl font-bold">Step 3 — Detecting the watermark position</h2>
        <p class="mb-4 leading-relaxed text-gray-400">
          The 48×48 and 96×96 alpha maps are bundled with the page. To find which one is on a given image and where it sits, the tool runs <strong class="text-white">normalized cross-correlation (NCC)</strong> between the alpha map and the bottom-right corner of the image. NCC is the same correlation metric used in template matching and stereo vision — it peaks at 1.0 when the watermark is exactly aligned, and drops below 0.7 for unrelated content.
        </p>
        <p class="mb-8 leading-relaxed text-gray-400">
          For images, the search runs in a few milliseconds. For video, the tool decodes one calibration frame at about 15% into the timeline, finds the position, and reuses it for every subsequent frame. That keeps the watermark tracking rock-steady across the clip.
        </p>

        <h2 class="mb-4 text-2xl font-bold">Step 4 — Image pipeline</h2>
        <ol class="mb-8 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-gray-400">
          <li>Read the uploaded image into an <code class="text-brand-400">HTMLImageElement</code>.</li>
          <li>Draw it into an offscreen canvas and pull the raw RGBA pixel buffer.</li>
          <li>Run NCC against the 48×48 and 96×96 alpha maps in the bottom-right quadrant.</li>
          <li>Apply the reverse alpha-blend equation pixel-wise inside the watermark box.</li>
          <li>Run edge diffusion on the few fully-opaque pixels in the logo center.</li>
          <li>Wrap the result in a new canvas and export as PNG.</li>
        </ol>

        <h2 class="mb-4 text-2xl font-bold">Step 5 — Video pipeline</h2>
        <ol class="mb-8 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-gray-400">
          <li>Demux the MP4 with mp4box.js — separate video samples from audio samples.</li>
          <li>Decode a single calibration frame near 15% with the WebCodecs VideoDecoder.</li>
          <li>Run NCC to find the watermark position.</li>
          <li>Loop: decode frame → reverse blend → re-encode with VideoEncoder.</li>
          <li>Mux the cleaned video with the original audio track bit-for-bit (mp4-muxer).</li>
          <li>Wrap in a Blob for download.</li>
        </ol>

        <h2 class="mb-4 text-2xl font-bold">Why this beats AI inpainting</h2>
        <p class="mb-4 leading-relaxed text-gray-400">
          Most "AI watermark removers" wrap a generative inpainting model around the watermark area. That model guesses what should be under the logo based on surrounding pixels. For uniform backgrounds (a clear sky, a blank wall) it works well. For textured areas — a building, a face, fabric — the guess is wrong. The result is a soft smudge where the original detail used to be.
        </p>
        <p class="mb-8 leading-relaxed text-gray-400">
          Reverse alpha blending recovers the original pixels exactly. If the watermark was on a textured building, the recovered texture is the original texture, not a diffusion-model hallucination of one. That is why the result is indistinguishable from a clean Gemini export.
        </p>

        <h2 class="mb-4 text-2xl font-bold">What about SynthID?</h2>
        <p class="mb-4 leading-relaxed text-gray-400">
          SynthID is Google's invisible watermark — a pattern embedded into the pixel values themselves across the entire image, detectable only with Google DeepMind's verifier. This tool does <strong class="text-white">not</strong> remove SynthID, because the operation is mathematically irreversible: SynthID is baked into every pixel, not stamped on a corner. The only way to scrub SynthID today is lossy regeneration with a different model.
        </p>
        <p class="mb-8 leading-relaxed text-gray-400">
          What this tool removes is the <strong class="text-white">visible sparkle</strong> — the four-point logo in the bottom-right corner. That is what every other "watermark remover" in this space targets.
        </p>

        <div class="rounded-3xl border border-brand-500/20 bg-brand-500/[0.03] p-8">
          <h2 class="mb-3 text-xl font-bold">Open source</h2>
          <p class="text-sm leading-relaxed text-gray-400">
            The processing logic lives in <code class="text-brand-400">lib/</code> and the Vue composables in <code class="text-brand-400">composables/</code>. The image pipeline is in <code class="text-brand-400">lib/imageProcessor.ts</code>, the video pipeline in <code class="text-brand-400">lib/videoProcessor.ts</code>, and the alpha maps in <code class="text-brand-400">lib/imageMasks.ts</code> and <code class="text-brand-400">lib/videoMasks.ts</code>. Pull the repo, run <code class="text-brand-400">npm install</code>, and inspect.
          </p>
        </div>
      </div>
    </article>

    <SiteFooter />
  </div>
</template>
