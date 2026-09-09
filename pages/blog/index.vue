<script setup lang="ts">
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

useSeoMeta({
  title: 'Blog — Gemini Watermark Guides, News & Deep-Dives',
  description:
    'Guides, news, and technical deep-dives on removing the Gemini, Veo, Imagen, Nano Banana, and Google Flow sparkle watermark. Reverse alpha blending, model news, and workflow tips.',
  ogTitle: 'Watermark Remover Blog',
  ogDescription: 'Guides, news, and technical deep-dives on Gemini watermarks.',
  ogImage: `${siteUrl}/og-image.png`,
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})

const posts = [
  {
    slug: 'google-removes-visible-gemini-watermark',
    title: "Google Just Made Gemini Watermarks Optional — Here's What It Means for You",
    excerpt: 'On August 14, 2026 Google added a Media Watermark toggle. Here is what changed, what stayed, and why you still need a remover for old files.',
    date: '2026-09-01',
    readTime: '6 min read',
    category: 'News',
  },
  {
    slug: 'how-to-remove-gemini-watermark',
    title: 'How to Remove the Gemini Watermark in 10 Seconds',
    excerpt: 'Step-by-step guide to stripping the Gemini sparkle from any image — no Photoshop, no upload, no signup.',
    date: '2026-08-22',
    readTime: '4 min read',
    category: 'Guide',
  },
  {
    slug: 'reverse-alpha-blending-explained',
    title: 'Reverse Alpha Blending: The Math Behind Removing AI Watermarks',
    excerpt: 'How a single equation reverses exactly what Google did to stamp the sparkle, and why no AI inpainting guesswork is needed.',
    date: '2026-08-15',
    readTime: '7 min read',
    category: 'Technical',
  },
  {
    slug: 'synthid-vs-visible-watermark',
    title: 'SynthID vs the Visible Watermark: What Stays After You Strip the Logo',
    excerpt: 'The visible sparkle is one of three provenance layers on a Gemini image. Here is what each layer does and which ones you can remove.',
    date: '2026-08-10',
    readTime: '6 min read',
    category: 'Technical',
  },
  {
    slug: 'why-google-watermarks-gemini-images',
    title: 'Why Google Puts a Watermark on Gemini Images (And How to Remove It)',
    excerpt: 'The real reasons behind the diamond watermark, the invisible SynthID layer, and what you can do about both.',
    date: '2026-08-05',
    readTime: '5 min read',
    category: 'Explainer',
  },
  {
    slug: 'gemini-vs-chatgpt-vs-midjourney-watermark',
    title: 'Gemini vs ChatGPT vs Midjourney — Which AI Image Generator Has the Cleanest Output?',
    excerpt: 'A side-by-side comparison of watermarking practices across the three biggest generators, including how to strip each one.',
    date: '2026-08-01',
    readTime: '7 min read',
    category: 'Comparison',
  },
  {
    slug: 'gemini-watermark-chrome-extension-vs-online-tool',
    title: 'Gemini Watermark Chrome Extension vs Online Tool: Which Should You Use?',
    excerpt: 'A practical breakdown of the two workflows, where each shines, and which is the better fit for your use case.',
    date: '2026-07-28',
    readTime: '5 min read',
    category: 'Comparison',
  },
  {
    slug: 'remove-gemini-watermark-youtube-thumbnail',
    title: 'How to Use Gemini Images for YouTube Thumbnails (Without the Watermark)',
    excerpt: 'Strip the sparkle, follow YouTube\'s safe-zone guidelines, and ship a thumbnail that does not look like an AI export.',
    date: '2026-07-22',
    readTime: '4 min read',
    category: 'Use case',
  },
  {
    slug: 'remove-gemini-watermark-social-media',
    title: 'Gemini Watermark Remover for Instagram, TikTok, and X — Workflow Guide',
    excerpt: 'How to clean up Gemini images for short-form social posts without tripping platform AI-content rules.',
    date: '2026-07-18',
    readTime: '4 min read',
    category: 'Use case',
  },
  {
    slug: 'remove-gemini-watermark-print-on-demand',
    title: 'Cleaning Gemini Images for Print on Demand (Redbubble, Merch by Amazon, TeePublic)',
    excerpt: 'Print-on-demand marketplaces reject AI-generated content with the visible Gemini mark. Here is how to fix that in seconds.',
    date: '2026-07-12',
    readTime: '5 min read',
    category: 'Use case',
  },
  {
    slug: 'remove-gemini-watermark-photoshop',
    title: 'How to Remove the Gemini Watermark in Photoshop (And a Faster Alternative)',
    excerpt: 'Step-by-step Photoshop tutorial using the Clone Stamp and Content-Aware Fill, plus a one-click alternative for when you do not want to fire up the desktop app.',
    date: '2026-07-05',
    readTime: '6 min read',
    category: 'Guide',
  },
  {
    slug: 'remove-gemini-watermark-gimp',
    title: 'How to Remove the Gemini Watermark in GIMP (Free Desktop Tutorial)',
    excerpt: 'Use the Clone Tool, Heal Selection, and Resynthesizer plugin to clean Gemini exports in GIMP — completely free.',
    date: '2026-06-30',
    readTime: '5 min read',
    category: 'Guide',
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a]">
    <SiteNav />
    <div class="h-16" />

    <section class="relative overflow-hidden pt-12 pb-12">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
      <div class="relative mx-auto max-w-4xl px-6 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
          The blog
        </div>
        <h1 class="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Notes on <span class="text-brand-400">AI watermarks</span>
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-gray-400">
          News, technical deep-dives, and practical guides for working with the Gemini, Veo, Imagen, Nano Banana, and Google Flow sparkle.
        </p>
      </div>
    </section>

    <section class="py-12">
      <div class="mx-auto max-w-4xl px-6">
        <div class="grid gap-6 md:grid-cols-2">
          <NuxtLink
            v-for="post in posts"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="group flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-brand-500/20"
          >
            <div class="mb-3 flex items-center gap-2 text-[10px] text-gray-500">
              <span class="rounded-full border border-brand-500/20 bg-brand-500/5 px-2 py-0.5 text-brand-400">{{ post.category }}</span>
              <span>·</span>
              <time :datetime="post.date">{{ new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</time>
              <span>·</span>
              <span>{{ post.readTime }}</span>
            </div>
            <h2 class="mb-2 text-lg font-semibold leading-snug text-white transition group-hover:text-brand-400">{{ post.title }}</h2>
            <p class="mb-4 flex-1 text-sm leading-relaxed text-gray-500">{{ post.excerpt }}</p>
            <span class="text-xs font-semibold text-brand-400">Read article →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
