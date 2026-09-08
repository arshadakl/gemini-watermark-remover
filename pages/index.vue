<script setup lang="ts">
/**
 * Main page — dark theme landing page with image/video processing.
 */

import type { ProcessingMode } from '~/lib/types'
import { checkVideoSupport, formatFileSize } from '~/lib/utils'
import { SUPPORTED_VIDEO_DIMS } from '~/lib/constants'

useHead({
  title: 'Gemini Watermark Remover — Remove AI Watermarks from Images & Videos',
  meta: [
    { name: 'description', content: 'Remove AI-generated watermarks from images and videos — 100% in your browser. No uploads. No waiting.' },
  ],
})

const mode = ref<ProcessingMode>('image')
const openFaq = ref<number | null>(null)

// ── Image state ───────────────────────────────────────────────────────────────
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const cleanedImageUrl = ref<string | null>(null)
const {
  isProcessing: imageProcessing,
  result: imageResult,
  error: imageError,
  process: processImage,
  reset: resetImage,
} = useImageProcessor()

// ── Video state ───────────────────────────────────────────────────────────────
const videoFile = ref<File | null>(null)
const videoPreviewUrl = ref<string | null>(null)
const {
  isProcessing: videoProcessing,
  stageLabel,
  progressPercent,
  resultBlob: videoResult,
  error: videoError,
  process: processVideo,
  reset: resetVideo,
} = useVideoProcessor()
const videoDownloadUrl = ref<string | null>(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const isBusy = computed(() => imageProcessing.value || videoProcessing.value)
const isDone = computed(() => (mode.value === 'image' && !!cleanedImageUrl.value) || (mode.value === 'video' && !!videoResult.value))
const currentError = computed(() => imageError.value || videoError.value)
const videoSupport = computed(() => checkVideoSupport())

// ── FAQ data ──────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Is my data really private?', a: 'Yes. All processing happens directly in your browser using Web APIs. No files are ever uploaded to any server. Your images and videos never leave your device.' },
  { q: 'What file types are supported?', a: 'We support PNG, JPG, WEBP, and GIF for images. For video, MP4 files with H.264 encoding are supported. Supported video resolutions: 1280×720, 720×1280, 1920×1080, and 1080×1920.' },
  { q: 'Can it remove all AI watermarks?', a: 'This tool removes the visible Gemini sparkle watermark added to AI-generated content. It does not remove invisible watermarks like Google\'s SynthID, which are embedded across all pixels.' },
  { q: 'Is it free to use?', a: 'Yes! The tool is completely free. The watermark removal algorithm runs entirely in your browser using WebCodecs and Canvas APIs.' },
  { q: 'Why do I need Chrome or Edge for video?', a: 'Video processing uses the WebCodecs API, which is currently only available in Chromium-based browsers (Chrome, Edge, Brave, Opera). Image processing works in all modern browsers.' },
]

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}

// ── Image handling ────────────────────────────────────────────────────────────
function onImageSelect(file: File) {
  resetImage()
  cleanedImageUrl.value = null
  imageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
}

async function handleImageProcess() {
  if (!imageFile.value) return
  const img = new Image()
  img.src = imagePreviewUrl.value!
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image'))
  })

  const res = await processImage(img)
  if (res?.removed) {
    const canvas = document.createElement('canvas')
    canvas.width = res.imageData.width
    canvas.height = res.imageData.height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(res.imageData, 0, 0)
    cleanedImageUrl.value = canvas.toDataURL('image/png')
  }
}

function resetImageAll() {
  resetImage()
  imageFile.value = null
  imagePreviewUrl.value = null
  cleanedImageUrl.value = null
}

// ── Video handling ────────────────────────────────────────────────────────────
function onVideoSelect(file: File) {
  resetVideo()
  videoResult.value && URL.revokeObjectURL(videoDownloadUrl.value!)
  videoDownloadUrl.value = null
  videoFile.value = file
  videoPreviewUrl.value = URL.createObjectURL(file)
}

async function handleVideoProcess() {
  if (!videoFile.value) return
  const ab = await videoFile.value.arrayBuffer()
  const blob = await processVideo(ab)
  if (blob) {
    videoDownloadUrl.value = URL.createObjectURL(blob)
  }
}

function resetVideoAll() {
  resetVideo()
  videoFile.value = null
  videoPreviewUrl.value = null
  videoDownloadUrl.value = null
}

function resetAll() {
  if (mode.value === 'image') resetImageAll()
  else resetVideoAll()
}

function switchMode(m: ProcessingMode) {
  mode.value = m
}

function scrollToTool() {
  document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a]">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20">
            <svg class="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <span class="text-lg font-bold">Gemini Watermark Remover</span>
        </div>
        <div class="hidden items-center gap-8 md:flex">
          <a href="#features" class="text-sm text-gray-400 transition hover:text-white">Features</a>
          <a href="#how-it-works" class="text-sm text-gray-400 transition hover:text-white">How it works</a>
          <a href="#faq" class="text-sm text-gray-400 transition hover:text-white">FAQ</a>
        </div>
        <button
          class="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-brand-400"
          @click="scrollToTool"
        >
          Get Started
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden pb-8 pt-28">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
      <div class="relative mx-auto max-w-6xl px-6">
        <div class="flex flex-col items-center text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            A cleaner internet, one image at a time
          </div>
          <h1 class="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Remove AI-generated watermarks from
            <span class="text-brand-400">images and videos</span>
          </h1>
          <p class="mb-10 max-w-xl text-lg text-gray-400">
            Clean, high-quality results — 100% in your browser. No uploads. No waiting.
          </p>
        </div>

        <!-- Tool Section -->
        <div id="tool" class="mx-auto max-w-2xl scroll-mt-24">
          <!-- Mode Toggle -->
          <div class="mb-6 flex justify-center">
            <div class="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                class="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                :class="mode === 'image' ? 'bg-brand-500 text-black' : 'text-gray-400 hover:text-white'"
                @click="switchMode('image')"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Image
              </button>
              <button
                class="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                :class="mode === 'video' ? 'bg-brand-500 text-black' : 'text-gray-400 hover:text-white'"
                :disabled="!videoSupport.supported"
                :title="videoSupport.reason ?? 'Requires Chrome, Edge, or Brave 94+'"
                @click="switchMode('video')"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Video
              </button>
            </div>
          </div>

          <!-- WebCodecs warning -->
          <div v-if="mode === 'video' && !videoSupport.supported" class="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center text-sm text-amber-400">
            {{ videoSupport.reason }}
          </div>

          <!-- Upload Area (no file selected) -->
          <template v-if="!imageFile && !videoFile">
            <div
              v-if="mode === 'image'"
              class="cursor-pointer rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center transition-all hover:border-brand-500/30 hover:bg-brand-500/5"
              @click="($refs.imageInput as HTMLInputElement).click()"
            >
              <input ref="imageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" @change="(e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) onImageSelect(f) }" />
              <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg class="h-7 w-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p class="mb-1 text-sm font-semibold text-white">Upload your image</p>
              <p class="text-xs text-gray-500">Drag & drop or click to upload</p>
              <p class="mt-2 text-xs text-gray-600">PNG, JPG, WEBP — any size</p>
            </div>
            <div
              v-else
              class="cursor-pointer rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center transition-all hover:border-brand-500/30 hover:bg-brand-500/5"
              :class="{ 'pointer-events-none opacity-40': !videoSupport.supported }"
              @click="videoSupport.supported && ($refs.videoInput as HTMLInputElement).click()"
            >
              <input ref="videoInput" type="file" accept="video/mp4" class="hidden" @change="(e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) onVideoSelect(f) }" />
              <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg class="h-7 w-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p class="mb-1 text-sm font-semibold text-white">Upload your video</p>
              <p class="text-xs text-gray-500">Drag & drop or click to upload</p>
              <p class="mt-2 text-xs text-gray-600">MP4 — 1280×720, 720×1280, 1920×1080, 1080×1920</p>
            </div>
          </template>

          <!-- File Preview Card (file selected) -->
          <template v-if="(mode === 'image' && imageFile) || (mode === 'video' && videoFile)">
            <div class="overflow-hidden rounded-3xl border border-brand-500/20 bg-[#0d1a0d] shadow-[0_0_60px_rgba(132,204,22,0.06)]">
              <!-- Header -->
              <div class="px-8 pt-8 text-center">
                <h2 class="mb-2 text-2xl font-bold">Preview <span class="text-brand-400">your file</span></h2>
                <p class="text-sm text-gray-400">Review your {{ mode }} and remove watermarks with one click.</p>
              </div>

              <!-- Preview area -->
              <div class="px-8 pt-6">
                <div class="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40">
                  <!-- Image preview -->
                  <template v-if="mode === 'image' && imageFile">
                    <img :src="imagePreviewUrl!" class="w-full object-contain" style="max-height: 320px;" alt="Preview" />
                    <!-- Cleaned overlay -->
                    <div v-if="cleanedImageUrl" class="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div class="text-center">
                        <p class="mb-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">Cleaned</p>
                        <img :src="cleanedImageUrl" class="mx-auto max-h-[260px] rounded-xl object-contain" alt="Cleaned" />
                      </div>
                    </div>
                  </template>
                  <!-- Video preview -->
                  <template v-if="mode === 'video' && videoFile">
                    <video :src="videoPreviewUrl!" controls class="w-full" style="max-height: 320px;" />
                  </template>
                </div>
              </div>

              <!-- File info bar -->
              <div class="mx-8 mt-4 flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <svg v-if="mode === 'video'" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="truncate text-sm font-medium text-white">{{ (imageFile || videoFile)!.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatFileSize((imageFile || videoFile)!.size) }}
                  </p>
                </div>
                <div v-if="imageResult?.removed || videoResult" class="flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1">
                  <svg class="h-3.5 w-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span class="text-xs font-semibold text-brand-400">Done</span>
                </div>
                <div v-else class="flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/5 px-3 py-1">
                  <svg class="h-3.5 w-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span class="text-xs font-semibold text-brand-400">Ready</span>
                </div>
              </div>

              <!-- Progress bar (processing) -->
              <div v-if="videoProcessing" class="mx-8 mt-3">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-xs text-gray-400">{{ stageLabel }}</span>
                  <span class="text-xs font-semibold text-brand-400">{{ progressPercent }}%</span>
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
                    :style="{ width: `${progressPercent}%` }"
                  />
                </div>
              </div>

              <!-- Action buttons -->
              <div class="px-8 py-6">
                <div class="flex gap-3">
                  <button
                    class="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition disabled:opacity-50"
                    :class="isDone && !isBusy ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-brand-500 text-black hover:bg-brand-400'"
                    :disabled="isBusy || isDone || (mode === 'video' && !videoSupport.supported)"
                    @click="mode === 'image' ? handleImageProcess() : handleVideoProcess()"
                  >
                    <!-- Spinner when processing -->
                    <svg v-if="isBusy" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <!-- Sparkle icon when idle/done -->
                    <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    {{ isBusy ? 'Processing...' : isDone ? 'Watermark Removed' : 'Remove Watermark' }}
                  </button>
                  <a
                    v-if="(mode === 'image' && cleanedImageUrl) || (mode === 'video' && videoDownloadUrl)"
                    :href="mode === 'image' ? cleanedImageUrl! : videoDownloadUrl!"
                    :download="mode === 'image' ? `cleaned-${imageFile!.name}` : `cleaned-${videoFile!.name}`"
                    class="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </a>
                  <a
                    v-else
                    class="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-gray-600 cursor-not-allowed"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </a>
                  <button
                    class="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5"
                    @click="resetAll"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              <!-- Trust badges -->
              <div class="border-t border-white/5 px-8 py-4">
                <div class="flex items-center justify-center gap-8 text-center">
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <div>
                      <p class="text-xs font-semibold text-white">Private</p>
                      <p class="text-[10px] text-gray-500">Your files stay in your browser</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    <div>
                      <p class="text-xs font-semibold text-white">Browser-based</p>
                      <p class="text-[10px] text-gray-500">No installation needed</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <div>
                      <p class="text-xs font-semibold text-white">No upload</p>
                      <p class="text-[10px] text-gray-500">100% local processing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Error -->
          <div v-if="currentError" class="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {{ currentError }}
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-20">
      <div class="mx-auto max-w-6xl px-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
              <svg class="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 class="mb-1 text-sm font-semibold">100% Private</h3>
            <p class="text-xs text-gray-500">All processing happens in your browser</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
              <svg class="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 class="mb-1 text-sm font-semibold">Super Fast</h3>
            <p class="text-xs text-gray-500">Get results in seconds</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
              <svg class="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <h3 class="mb-1 text-sm font-semibold">No Uploads</h3>
            <p class="text-xs text-gray-500">Your files never leave your device</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
              <svg class="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <h3 class="mb-1 text-sm font-semibold">High Quality</h3>
            <p class="text-xs text-gray-500">Keeps the original resolution</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-20">
      <div class="mx-auto max-w-6xl px-6">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400">How it works</p>
        <h2 class="mb-10 text-3xl font-bold">Three simple steps</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">1</div>
            <h3 class="mb-2 text-sm font-semibold">Upload your file</h3>
            <p class="text-xs leading-relaxed text-gray-500">Drag and drop or click to upload an image or video with a Gemini watermark.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">2</div>
            <h3 class="mb-2 text-sm font-semibold">Remove watermark</h3>
            <p class="text-xs leading-relaxed text-gray-500">Click "Remove Watermark" — the algorithm detects and removes the sparkle stamp using reverse alpha blending.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">3</div>
            <h3 class="mb-2 text-sm font-semibold">Download clean result</h3>
            <p class="text-xs leading-relaxed text-gray-500">Download the cleaned image or video. All processing happens locally — your files never leave your device.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-20">
      <div class="mx-auto max-w-3xl px-6">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400">Questions? We've got answers</p>
        <h2 class="mb-10 text-3xl font-bold">Frequently asked questions</h2>
        <div class="space-y-3">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="rounded-xl border border-white/5 bg-white/[0.02] transition-all"
            :class="{ 'border-brand-500/20 bg-brand-500/5': openFaq === i }"
          >
            <button
              class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium"
              @click="toggleFaq(i)"
            >
              {{ faq.q }}
              <svg
                class="h-4 w-4 text-gray-500 transition-transform"
                :class="{ 'rotate-45': openFaq === i }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <div v-if="openFaq === i" class="px-6 pb-4 text-xs leading-relaxed text-gray-400">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20">
      <div class="mx-auto max-w-4xl px-6">
        <div class="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-transparent p-10">
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
          <div class="relative">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400">Ready for a cleaner content?</p>
            <h2 class="mb-4 text-3xl font-bold">Remove AI watermarks <span class="text-brand-400">today.</span></h2>
            <div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-gray-400">Fast. Private. No uploads. Just clean results.</p>
              <button
                class="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-brand-400"
                @click="scrollToTool"
              >
                Start cleaning now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/5 py-8">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div class="flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded bg-brand-500/20">
            <svg class="h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <span class="text-sm font-semibold">Gemini Watermark Remover</span>
        </div>
        <p class="text-xs text-gray-600">All processing happens in your browser. No files are uploaded to any server.</p>
      </div>
    </footer>
  </div>
</template>
