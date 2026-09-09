<script setup lang="ts">
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

useSeoMeta({
  title: 'Gemini Video Watermark Remover — Strip Veo Watermarks from Every Frame',
  description:
    'Remove the Gemini, Veo, Imagen, and Google Flow sparkle watermark from MP4 videos frame by frame. 100% browser-based, audio preserved, supports 720p and 1080p. Free.',
  ogTitle: 'Gemini Video Watermark Remover — Veo & Google Flow',
  ogDescription: 'Strip the Gemini sparkle from every frame of your video. Free, browser-based, audio preserved.',
  ogImage: `${siteUrl}/og/video-watermark-remover.png`,
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to remove the Gemini watermark from a video',
        description: 'Strip the visible Gemini, Veo, Imagen, or Google Flow sparkle from an MP4 file, frame by frame, in the browser.',
        step: [
          { '@type': 'HowToStep', name: 'Switch to video mode', text: 'Open the tool and click the Video tab.' },
          { '@type': 'HowToStep', name: 'Upload MP4', text: 'Drop your exported Gemini, Veo, Imagen, or Google Flow video file.' },
          { '@type': 'HowToStep', name: 'Detect watermark', text: 'The tool decodes a calibration frame and locates the sparkle automatically.' },
          { '@type': 'HowToStep', name: 'Process frames', text: 'Every video frame is decoded via WebCodecs, cleaned, and re-encoded.' },
          { '@type': 'HowToStep', name: 'Mux audio', text: 'The original audio track is copied bit-for-bit and muxed with the cleaned video.' },
          { '@type': 'HowToStep', name: 'Download MP4', text: 'Save the clean video with original resolution and bitrate.' },
        ],
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a]">
    <SiteNav />
    <div class="h-16" />

    <section class="relative overflow-hidden pt-12 pb-16">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
      <div class="relative mx-auto max-w-4xl px-6 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
          Video tool · WebCodecs · Audio preserved
        </div>
        <h1 class="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Gemini <span class="text-brand-400">Video Watermark Remover</span>
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
          Remove the Veo, Imagen, and Google Flow sparkle from every frame of your AI-generated video. Frame-by-frame reverse alpha-blend, original audio preserved, no upload, no re-encode penalty.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-black transition hover:bg-brand-400"
        >
          Open the video tool
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400">Supported sources</p>
        <h2 class="mb-6 text-3xl font-bold">Works on every Google AI video surface</h2>
        <p class="mb-8 leading-relaxed text-gray-400">
          The same sparkle watermark that appears on Gemini stills is stamped on every frame of every Veo, Imagen, and Google Flow export. This tool tracks the logo across the timeline and removes it from each frame consistently — no flicker, no smear, no dropped frames. Audio is extracted with mp4box.js, preserved bit-for-bit, and muxed back in with mp4-muxer.
        </p>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-2 text-sm font-semibold text-brand-400">Veo 2 & Veo 3</h3>
            <p class="text-xs leading-relaxed text-gray-500">Google's flagship video model. Watermark appears in the same corner as Gemini stills.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-2 text-sm font-semibold text-brand-400">Google Flow</h3>
            <p class="text-xs leading-relaxed text-gray-500">Filmmaking workspace exports MP4 with the visible Gemini mark. Frame-by-frame cleanup, no manual masking.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-2 text-sm font-semibold text-brand-400">Imagen video</h3>
            <p class="text-xs leading-relaxed text-gray-500">Imagen's video model uses the same watermark pipeline as Veo.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-2 text-sm font-semibold text-brand-400">AI Studio exports</h3>
            <p class="text-xs leading-relaxed text-gray-500">Anything you exported from aistudio.google.com at one of the supported resolutions.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400">Supported resolutions</p>
        <h2 class="mb-6 text-3xl font-bold">720p and 1080p, portrait and landscape</h2>
        <p class="mb-8 leading-relaxed text-gray-400">
          The video pipeline uses the WebCodecs API to decode and re-encode. Both landscape and portrait orientations are handled by the same reverse-blend pipeline because the watermark position is detected per file, not assumed from resolution.
        </p>
        <div class="overflow-hidden rounded-2xl border border-white/5">
          <table class="w-full text-sm">
            <thead class="bg-white/5 text-left text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th class="px-5 py-3">Resolution</th>
                <th class="px-5 py-3">Orientation</th>
                <th class="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-xs text-gray-300">
              <tr><td class="px-5 py-3 font-mono">1280×720</td><td class="px-5 py-3">Landscape</td><td class="px-5 py-3 text-brand-400">Supported</td></tr>
              <tr><td class="px-5 py-3 font-mono">1920×1080</td><td class="px-5 py-3">Landscape</td><td class="px-5 py-3 text-brand-400">Supported</td></tr>
              <tr><td class="px-5 py-3 font-mono">720×1280</td><td class="px-5 py-3">Portrait</td><td class="px-5 py-3 text-brand-400">Supported</td></tr>
              <tr><td class="px-5 py-3 font-mono">1080×1920</td><td class="px-5 py-3">Portrait</td><td class="px-5 py-3 text-brand-400">Supported</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <div class="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8">
          <h2 class="mb-3 text-xl font-bold">Browser requirement: WebCodecs API</h2>
          <p class="text-sm leading-relaxed text-gray-300">
            Video decoding uses the WebCodecs API, which is currently available in Chrome, Edge, Brave, and Opera version 94 and above. Safari and Firefox do not yet ship a stable WebCodecs implementation. Image processing works in every modern browser, including Safari and Firefox.
          </p>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <p class="mb-6 text-xs font-semibold uppercase tracking-wider text-brand-400">Related tools</p>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink to="/veo-watermark-remover" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">Veo watermark remover →</h3>
            <p class="text-xs text-gray-500">Targeted at Veo 2 and Veo 3 outputs.</p>
          </NuxtLink>
          <NuxtLink to="/google-flow-watermark-remover" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">Google Flow watermark remover →</h3>
            <p class="text-xs text-gray-500">For clips exported from the Flow filmmaking workspace.</p>
          </NuxtLink>
          <NuxtLink to="/image-watermark-remover" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">Image watermark remover →</h3>
            <p class="text-xs text-gray-500">For still images from Gemini, Imagen, and Nano Banana.</p>
          </NuxtLink>
          <NuxtLink to="/how-it-works" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">How it works →</h3>
            <p class="text-xs text-gray-500">The technical breakdown of reverse alpha blending.</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
