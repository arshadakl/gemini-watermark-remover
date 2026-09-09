<template>
  <footer class="border-t border-white/5 py-12">
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid gap-8 md:grid-cols-4">
        <!-- Brand -->
        <div>
          <div class="mb-4 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20">
              <svg class="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
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
          Built by
          <a
            href="https://arshadakl.in"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 transition hover:text-brand-400"
            >Arshad</a
          >
          · website:
          <a
            href="https://arshadakl.in"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-400 transition hover:text-brand-300"
            >arshadakl.in</a
          >
        </p>
      </div>
    </div>
  </footer>
</template>
