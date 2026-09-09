<script setup lang="ts">
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

useSeoMeta({
  title: 'Terms of Service',
  description:
    'Terms of Service for Watermark Remover: permitted use, prohibited use, disclaimers, and limitations of liability.',
  ogTitle: 'Terms of Service — Watermark Remover',
  ogDescription: 'The rules for using this tool.',
  ogImage: `${siteUrl}/og/terms.png`,
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
          Terms of <span class="text-brand-400">Service</span>
        </h1>
      </div>
    </section>

    <article class="py-12">
      <div class="mx-auto max-w-3xl px-6 space-y-6 leading-relaxed text-gray-300">
        <p>
          By using Watermark Remover (the "Service") you agree to these terms. If you do not agree, do not use the Service.
        </p>

        <h2 class="text-2xl font-bold text-white">1. The Service</h2>
        <p>
          Watermark Remover is a free, browser-based utility that removes the visible sparkle watermark stamped by Google's Gemini, Veo, Imagen, Nano Banana, and Google Flow products from images and videos that you have the right to modify. The Service is provided as-is, with no warranty of any kind.
        </p>

        <h2 class="text-2xl font-bold text-white">2. Permitted use</h2>
        <p>You may use the Service to:</p>
        <ul class="list-disc space-y-2 pl-6 text-sm text-gray-400">
          <li>Remove the visible watermark from images and videos you generated yourself on Google AI surfaces.</li>
          <li>Remove the visible watermark from images and videos you own, or for which you have explicit written permission to modify.</li>
          <li>Use the cleaned files for any lawful purpose — personal, commercial, educational, or otherwise.</li>
        </ul>

        <h2 class="text-2xl font-bold text-white">3. Prohibited use</h2>
        <p>You may not use the Service to:</p>
        <ul class="list-disc space-y-2 pl-6 text-sm text-gray-400">
          <li>Strip the watermark from copyrighted material you do not own or have permission to modify.</li>
          <li>Misrepresent AI-generated content as human-made, or otherwise deceive viewers about the origin of media.</li>
          <li>Violate any applicable law, regulation, or third-party right.</li>
          <li>Attempt to reverse-engineer, scrape, or otherwise extract the source code or alpha maps for the purpose of building a competing commercial service.</li>
          <li>Use the Service in any way that could damage, disable, overburden, or impair our infrastructure.</li>
        </ul>

        <h2 class="text-2xl font-bold text-white">4. No affiliation with Google</h2>
        <p>
          The Service is not affiliated with, endorsed by, or sponsored by Google LLC. Gemini, Veo, Imagen, Nano Banana, Google Flow, Google AI Studio, and SynthID are trademarks of Google LLC. References to these products are for descriptive purposes only.
        </p>

        <h2 class="text-2xl font-bold text-white">5. SynthID and provenance</h2>
        <p>
          The Service removes only the visible sparkle watermark. It does not remove SynthID or any other invisible provenance signal Google embeds in AI-generated media. If you publish AI-generated content, you are responsible for understanding and complying with disclosure rules that apply to your jurisdiction and platform. Removing the visible badge does not remove the underlying provenance.
        </p>

        <h2 class="text-2xl font-bold text-white">6. Accuracy disclaimer</h2>
        <p>
          We make reasonable efforts to keep the watermark removal algorithm accurate, but we do not guarantee that the cleaned output will be byte-perfect in every case. Image compression, screenshots, heavy re-encoding, and unusual export formats may reduce accuracy. For best results, use the original export from Gemini or the supported Google AI surface.
        </p>

        <h2 class="text-2xl font-bold text-white">7. Disclaimer of warranties</h2>
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, and accuracy of results. We do not warrant that the Service will be uninterrupted, error-free, or that defects will be corrected.
        </p>

        <h2 class="text-2xl font-bold text-white">8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, loss of profits, or business interruption, even if we have been advised of the possibility of such damages.
        </p>

        <h2 class="text-2xl font-bold text-white">9. Indemnification</h2>
        <p>
          You agree to indemnify and hold us harmless from any claim, demand, loss, or expense arising out of your use of the Service, your violation of these terms, or your violation of any third-party right.
        </p>

        <h2 class="text-2xl font-bold text-white">10. Changes</h2>
        <p>
          We may update these terms at any time. Material changes will be announced on the homepage and dated at the top of this page. Continued use of the Service after a change constitutes acceptance.
        </p>

        <h2 class="text-2xl font-bold text-white">11. Governing law</h2>
        <p>
          These terms are governed by the laws of the jurisdiction in which the operator resides, without regard to conflict-of-laws principles. Any dispute will be resolved in the competent courts of that jurisdiction.
        </p>

        <h2 class="text-2xl font-bold text-white">12. Contact</h2>
        <p>
          Questions about these terms? Use the <NuxtLink to="/contact" class="text-brand-400 transition hover:text-brand-300">Contact</NuxtLink> page.
        </p>
      </div>
    </article>

    <SiteFooter />
  </div>
</template>
