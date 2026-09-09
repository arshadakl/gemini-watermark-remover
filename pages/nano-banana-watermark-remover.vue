<script setup lang="ts">
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

useSeoMeta({
  title: 'Nano Banana Watermark Remover — Free, Browser-Based',
  description:
    'Remove the diamond watermark from Nano Banana and Gemini images. Reverse alpha-blend cleanup, no upload, no signup, supports PNG, JPG, WEBP. Free forever.',
  ogTitle: 'Nano Banana Watermark Remover — Free',
  ogDescription: "Strip the Gemini sparkle from Nano Banana outputs in seconds. 100% in your browser.",
  ogImage: `${siteUrl}/og/nano-banana-watermark-remover.png`,
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
          Targeted for Google's Nano Banana model
        </div>
        <h1 class="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Nano Banana <span class="text-brand-400">Watermark Remover</span>
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
          Nano Banana is Google's newest image generation model, integrated into Gemini. It ships the same diamond sparkle watermark as every other Gemini export — and this tool strips it in seconds, entirely in your browser.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-black transition hover:bg-brand-400"
        >
          Open the tool
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400">About Nano Banana</p>
        <h2 class="mb-6 text-3xl font-bold">Same watermark as Gemini, different model name</h2>
        <p class="mb-6 leading-relaxed text-gray-400">
          Nano Banana is the nickname for Google's latest image generation model. Under the hood it is still part of the Gemini family, and every output carries the same visible diamond sparkle in the bottom-right corner — exactly the same logo, in exactly the same position, at exactly the same sizes (48×48 for older exports, 96×96 for newer ones). That means the algorithm and alpha maps built for Gemini work on Nano Banana unchanged.
        </p>
        <p class="leading-relaxed text-gray-400">
          If you have a Nano Banana PNG and you upload it to this tool, the detector sees the same watermark it sees on Gemini, Imagen, and any other Google AI image. There is no special case to handle.
        </p>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <p class="mb-6 text-xs font-semibold uppercase tracking-wider text-brand-400">Common Nano Banana use cases</p>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink to="/blog/remove-gemini-watermark-youtube-thumbnail" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">YouTube thumbnails →</h3>
            <p class="text-xs text-gray-500">Strip the sparkle before publishing Nano Banana thumbnails.</p>
          </NuxtLink>
          <NuxtLink to="/blog/remove-gemini-watermark-social-media" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">Instagram & TikTok →</h3>
            <p class="text-xs text-gray-500">Post Nano Banana art without the AI badge in the corner.</p>
          </NuxtLink>
          <NuxtLink to="/blog/remove-gemini-watermark-print-on-demand" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">Print on demand →</h3>
            <p class="text-xs text-gray-500">T-shirts, posters, book covers — clean Nano Banana art for print.</p>
          </NuxtLink>
          <NuxtLink to="/blog/remove-gemini-watermark-photoshop" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20">
            <h3 class="mb-1 text-sm font-semibold">Photoshop workflow →</h3>
            <p class="text-xs text-gray-500">Clean first, then edit. Faster than Content-Aware Fill.</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <div class="rounded-3xl border border-brand-500/20 bg-brand-500/[0.03] p-8">
          <h2 class="mb-3 text-xl font-bold">Why the watermark looks the same</h2>
          <p class="text-sm leading-relaxed text-gray-400">
            Google's watermark pipeline is shared across the image models. Whether the image comes from Gemini 1.5, Gemini 2.0 Flash, Imagen 3, Imagen 4, or Nano Banana, the alpha-blend math is identical. That is why one tool can clean them all — and why competitors that rely on AI inpainting (which guesses what should be under the logo) tend to smear the edge. Reverse alpha blending recovers the original pixels exactly.
          </p>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
