<script setup lang="ts">
const props = defineProps<{ cta?: boolean }>()
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-2">
        <img src="/logo/logo.png" alt="Watermark Remover" class="h-8 w-8 rounded-lg" />
        <span class="text-lg font-bold">Watermark Remover</span>
      </NuxtLink>
      <div class="hidden items-center gap-8 md:flex">
        <NuxtLink to="/image-watermark-remover" class="text-sm text-gray-400 transition hover:text-white">Image</NuxtLink>
        <NuxtLink to="/video-watermark-remover" class="text-sm text-gray-400 transition hover:text-white">Video</NuxtLink>
        <NuxtLink to="/how-it-works" class="text-sm text-gray-400 transition hover:text-white">How it works</NuxtLink>
        <NuxtLink to="/blog" class="text-sm text-gray-400 transition hover:text-white">Blog</NuxtLink>
        <NuxtLink to="/about" class="text-sm text-gray-400 transition hover:text-white">About</NuxtLink>
      </div>
      <NuxtLink
        v-if="props.cta !== false"
        to="/"
        class="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-brand-400"
      >
        Get Started
      </NuxtLink>
    </div>
  </nav>
</template>
