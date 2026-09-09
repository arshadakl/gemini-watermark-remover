<script setup lang="ts">
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

useSeoMeta({
  title: 'Veo Watermark Remover — Free, Frame-Perfect Video Cleanup',
  description:
    'Remove the Veo video watermark from every frame of your MP4. Free browser-based tool, audio preserved, supports 720p and 1080p. Works on Veo 2 and Veo 3.',
  ogTitle: 'Veo Watermark Remover — Free & Frame-Perfect',
  ogDescription: 'Strip the Veo sparkle from every frame. 100% in your browser, audio preserved.',
  ogImage: `${siteUrl}/og/veo-watermark-remover.svg`,
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

    <section class="relative overflow-hidden pt-12 pb-16">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
      <div class="relative mx-auto max-w-4xl px-6 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
          Video tool · Veo 2 · Veo 3 · Flow
        </div>
        <h1 class="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Veo <span class="text-brand-400">Watermark Remover</span>
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
          Strip the Veo sparkle from every frame of your AI-generated video. Same reverse alpha-blend pipeline used for Veo 2 and Veo 3, frame-by-frame, audio preserved, no upload.
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
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400">How Veo watermarking works</p>
        <h2 class="mb-6 text-3xl font-bold">Same logo, every frame</h2>
        <p class="mb-6 leading-relaxed text-gray-400">
          Veo is Google's flagship video generation model. Every clip it produces carries the same visible Gemini sparkle logo in the corner, stamped on every frame. That makes the watermark hard to remove with a crop or blur (the corner would need to be patched across thousands of frames) and easy to remove with the right math — apply the reverse alpha-blend pixel-wise to each frame, and the original pixels come back intact.
        </p>
        <p class="leading-relaxed text-gray-400">
          This tool demuxes the MP4, decodes each frame with the WebCodecs API, applies the reverse blend, and re-encodes the result. The original audio is preserved bit-for-bit and muxed back in. Frame rate, resolution, and bitrate stay exactly as Veo rendered them.
        </p>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <p class="mb-6 text-xs font-semibold uppercase tracking-wider text-brand-400">Supported resolutions</p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-1 text-sm font-semibold">1280×720 landscape</h3>
            <p class="text-xs text-gray-500">Default Veo 2 export.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-1 text-sm font-semibold">1920×1080 landscape</h3>
            <p class="text-xs text-gray-500">Veo 3 in high-definition mode.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-1 text-sm font-semibold">720×1280 portrait</h3>
            <p class="text-xs text-gray-500">Vertical Veo clips for Shorts / Reels / TikTok.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-1 text-sm font-semibold">1080×1920 portrait</h3>
            <p class="text-xs text-gray-500">HD portrait Veo.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <div class="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8">
          <h2 class="mb-3 text-xl font-bold">Browser requirement</h2>
          <p class="text-sm leading-relaxed text-gray-300">
            Veo cleanup uses the WebCodecs API for hardware-accelerated decode and encode. That is currently available in Chrome, Edge, Brave, and Opera 94+. Image processing works in every modern browser, including Safari and Firefox.
          </p>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <p class="mb-6 text-xs font-semibold uppercase tracking-wider text-brand-400">Related tools</p>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink to="/video-watermark-remover" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">All video formats →</h3>
            <p class="text-xs text-gray-500">General-purpose video tool for any Gemini model.</p>
          </NuxtLink>
          <NuxtLink to="/google-flow-watermark-remover" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">Google Flow exports →</h3>
            <p class="text-xs text-gray-500">Same Veo watermark, different pipeline.</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
