<template>
  <footer class="border-t border-white/5 py-12">
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid gap-8 md:grid-cols-4">
        <!-- Brand -->
        <div>
          <div class="mb-4 flex items-center gap-2">
            <img src="/logo/logo.png" alt="Watermark Remover" class="h-8 w-8 rounded-lg" />
            <span class="text-base font-semibold">Watermark Remover</span>
          </div>
          <p class="text-xs leading-relaxed text-gray-500">
            A free, browser-based tool for removing the Gemini, Veo, Imagen, Nano Banana, and Google Flow sparkle watermark from AI-generated images and videos.
          </p>
        </div>

        <!-- Tool -->
        <div>
          <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-300">Tool</p>
          <ul class="space-y-2 text-xs text-gray-500">
            <li><NuxtLink to="/" class="transition hover:text-white">Gemini Watermark Remover</NuxtLink></li>
            <li><NuxtLink to="/image-watermark-remover" class="transition hover:text-white">Image Watermark Remover</NuxtLink></li>
            <li><NuxtLink to="/video-watermark-remover" class="transition hover:text-white">Video Watermark Remover</NuxtLink></li>
            <li><NuxtLink to="/nano-banana-watermark-remover" class="transition hover:text-white">Nano Banana Remover</NuxtLink></li>
            <li><NuxtLink to="/veo-watermark-remover" class="transition hover:text-white">Veo Watermark Remover</NuxtLink></li>
            <li><NuxtLink to="/google-flow-watermark-remover" class="transition hover:text-white">Google Flow Remover</NuxtLink></li>
          </ul>
        </div>

        <!-- Learn -->
        <div>
          <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-300">Learn</p>
          <ul class="space-y-2 text-xs text-gray-500">
            <li><NuxtLink to="/how-it-works" class="transition hover:text-white">How it works</NuxtLink></li>
            <li><NuxtLink to="/blog" class="transition hover:text-white">Blog</NuxtLink></li>
            <li><NuxtLink to="/blog/reverse-alpha-blending-explained" class="transition hover:text-white">Reverse Alpha Blending</NuxtLink></li>
            <li><NuxtLink to="/blog/google-removes-visible-gemini-watermark" class="transition hover:text-white">August 2026 Update</NuxtLink></li>
            <li><NuxtLink to="/about" class="transition hover:text-white">About</NuxtLink></li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-300">Legal</p>
          <ul class="space-y-2 text-xs text-gray-500">
            <li><NuxtLink to="/privacy-policy" class="transition hover:text-white">Privacy Policy</NuxtLink></li>
            <li><NuxtLink to="/terms" class="transition hover:text-white">Terms of Service</NuxtLink></li>
            <li><NuxtLink to="/contact" class="transition hover:text-white">Contact</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-[11px] text-gray-600 md:flex-row">
        <p>© 2026 Watermark Remover · Not affiliated with Google. All processing happens in your browser.</p>
        <p>
          Made with
          <svg class="mx-0.5 inline-block h-3 w-3 text-brand-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          by
          <a
            href="https://arshadakl.in"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 transition hover:text-brand-400"
            >Arshad</a
          >
        </p>
      </div>
    </div>
  </footer>
</template>
