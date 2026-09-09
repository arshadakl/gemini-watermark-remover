<script setup lang="ts">
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

useSeoMeta({
  title: 'Privacy Policy',
  description:
    "Watermark Remover's privacy policy: what we collect (nothing), how processing works (entirely in your browser), and what we never do.",
  ogTitle: 'Privacy Policy — Watermark Remover',
  ogDescription: 'We collect nothing. All processing happens in your browser.',
  ogImage: `${siteUrl}/og-image.png`,
  ogUrl: pageUrl,
  twitterCard: 'summary',
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a]">
    <SiteNav />
    <div class="h-16" />

    <section class="relative overflow-hidden pt-12 pb-8">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
      <div class="relative mx-auto max-w-3xl px-6 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
          Last updated: September 2026
        </div>
        <h1 class="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Privacy <span class="text-brand-400">Policy</span>
        </h1>
        <p class="text-sm text-gray-500">Short version: we don't collect anything. Read on for the legal version.</p>
      </div>
    </section>

    <article class="py-12">
      <div class="mx-auto max-w-3xl px-6 space-y-6 leading-relaxed text-gray-300">
        <h2 class="text-2xl font-bold text-white">Summary</h2>
        <p>
          Watermark Remover (the "Service", "we", "us") is a privacy-first tool. We do not collect, transmit, store, sell, or share any of your personal data, uploaded files, or processing results. The entire watermark removal pipeline runs locally in your browser using the Canvas API for images and the WebCodecs API for video. Your files never leave your device.
        </p>

        <h2 class="text-2xl font-bold text-white">1. Data we do not collect</h2>
        <p>We do not collect or process on our servers:</p>
        <ul class="list-disc space-y-2 pl-6 text-sm text-gray-400">
          <li>Uploaded images or videos</li>
          <li>Processed (cleaned) images or videos</li>
          <li>Filenames, file sizes, or any file metadata</li>
          <li>IP addresses in any persistent log</li>
          <li>Browser fingerprint data</li>
          <li>Account credentials (we have no login)</li>
          <li>Payment information (the Service is free)</li>
        </ul>

        <h2 class="text-2xl font-bold text-white">2. How processing actually works</h2>
        <p>
          When you upload a file, it is read into the browser's memory via JavaScript. The processing pipeline runs entirely on your device: NCC detection against bundled alpha maps, reverse alpha-blend, and PNG/MP4 export. The output is wrapped in a <code class="text-brand-400">Blob</code> URL and downloaded directly from your browser to your machine. At no point does the file data leave your device.
        </p>
        <p>
          Bundled assets (alpha masks, fonts, the JavaScript bundle) are served from our CDN so the page loads. Standard HTTP request metadata — your IP address, user-agent, and referer — is logged by the CDN edge for caching and abuse prevention, typically retained for 30 days, and not linked to any user profile.
        </p>

        <h2 class="text-2xl font-bold text-white">3. Cookies</h2>
        <p>
          The Service does not set any cookies. We do not use third-party analytics, advertising networks, or tracking pixels. If we add analytics in the future (such as Plausible, which is cookieless), we will update this policy and request consent where required by law.
        </p>

        <h2 class="text-2xl font-bold text-white">4. Third-party services</h2>
        <p>The page itself loads one external resource:</p>
        <ul class="list-disc space-y-2 pl-6 text-sm text-gray-400">
          <li>Google Fonts (Space Grotesk) — for the UI font. Google may log the request. Consider self-hosting the font or using a browser extension to block external fonts if this matters to you.</li>
          <li>FormSubmit.co — for the Contact form only. When you submit the form, the name, email, and message you entered are sent to FormSubmit, which forwards them to our inbox. FormSubmit does not log your IP or set tracking cookies. See <a class="text-brand-400" href="https://formsubmit.co" target="_blank" rel="noopener noreferrer">formsubmit.co</a> for their own privacy practices.</li>
        </ul>
        <p>We do not use any other third-party services, scripts, or trackers.</p>

        <h2 class="text-2xl font-bold text-white">5. Children's privacy</h2>
        <p>
          The Service is not directed at children under 13. We do not knowingly collect any information from children. Because we do not collect any information from anyone, this is largely moot.
        </p>

        <h2 class="text-2xl font-bold text-white">6. International transfers</h2>
        <p>
          Because no personal data leaves your device, there are no international transfers to govern. The only data that crosses borders is the standard HTTPS request to fetch the page itself and its bundled assets.
        </p>

        <h2 class="text-2xl font-bold text-white">7. Your rights</h2>
        <p>
          Under GDPR, CCPA, and similar regulations, you have the right to access, correct, delete, and export your personal data. Because we do not collect personal data, there is nothing to access, correct, delete, or export. If you have a request, contact us via the <NuxtLink to="/contact" class="text-brand-400 transition hover:text-brand-300">Contact</NuxtLink> page and we will respond within 30 days.
        </p>

        <h2 class="text-2xl font-bold text-white">8. Security</h2>
        <p>
          The Service is served over HTTPS. The processing pipeline runs in your browser's sandbox; no file data is ever exposed to the page's network stack. We follow standard web security practices: content security policy, subresource integrity for bundled assets, and no third-party scripts.
        </p>

        <h2 class="text-2xl font-bold text-white">9. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be announced on the homepage and dated at the top of this page. Continued use of the Service after a change constitutes acceptance.
        </p>

        <h2 class="text-2xl font-bold text-white">10. Disclaimer</h2>
        <p>
          This Service is not affiliated with, endorsed by, or sponsored by Google LLC. Gemini, Veo, Imagen, Nano Banana, Google Flow, and SynthID are trademarks of Google LLC. The watermark removal described here targets only the visible sparkle logo that Google stamps on its AI outputs; it does not remove the invisible SynthID watermark.
        </p>

        <h2 class="text-2xl font-bold text-white">11. Contact</h2>
        <p>
          Questions about this policy? Use the <NuxtLink to="/contact" class="text-brand-400 transition hover:text-brand-300">Contact</NuxtLink> page.
        </p>
      </div>
    </article>

    <SiteFooter />
  </div>
</template>
