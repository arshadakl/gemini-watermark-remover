<script setup lang="ts">
/**
 * Main page — image/video toggle, upload, process, preview, download.
 */

import type { ProcessingMode } from '~/lib/types'
import { checkVideoSupport, formatFileSize } from '~/lib/utils'
import { SUPPORTED_VIDEO_DIMS } from '~/lib/constants'

const mode = ref<ProcessingMode>('image')

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
const currentError = computed(() => imageError.value || videoError.value)
const videoSupport = computed(() => checkVideoSupport())

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
  resetAll()
  mode.value = m
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <!-- Header -->
    <header class="mb-10 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        Gemini Watermark Remover
      </h1>
      <p class="mt-2 text-gray-500">
        Remove AI-generated watermarks — 100% in your browser.
      </p>
    </header>

    <!-- Mode toggle -->
    <div class="mb-8 flex justify-center">
      <div class="inline-flex rounded-xl bg-gray-100 p-1">
        <button
          class="rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200"
          :class="mode === 'image'
            ? 'bg-white text-brand-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
          @click="switchMode('image')"
        >
          <span class="mr-1.5">🖼️</span> Image
        </button>
        <button
          class="rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200"
          :class="mode === 'video'
            ? 'bg-white text-brand-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
          :disabled="!videoSupport.supported"
          :title="videoSupport.reason ?? 'Video processing requires Chrome, Edge, or Brave 94+'"
          @click="switchMode('video')"
        >
          <span class="mr-1.5">🎬</span> Video
        </button>
      </div>
    </div>

    <!-- WebCodecs warning -->
    <div v-if="mode === 'video' && !videoSupport.supported" class="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 ring-1 ring-amber-200">
      {{ videoSupport.reason }}
    </div>

    <!-- Image mode -->
    <template v-if="mode === 'image'">
      <FileUploader
        v-if="!imageFile"
        accept="image/png,image/jpeg,image/webp,image/gif"
        :disabled="isBusy"
        @select="onImageSelect"
      >
        <template #hint>PNG, JPG, or WEBP — any size supported</template>
      </FileUploader>

      <!-- Image preview + actions -->
      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
            <p class="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Original</p>
            <img :src="imagePreviewUrl!" alt="Original" class="w-full rounded-lg object-contain" style="max-height: 300px;" />
          </div>
          <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
            <p class="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cleaned</p>
            <img
              v-if="cleanedImageUrl"
              :src="cleanedImageUrl"
              alt="Cleaned"
              class="w-full rounded-lg object-contain"
              style="max-height: 300px;"
            />
            <div v-else class="flex h-[268px] items-center justify-center text-sm text-gray-300">
              Waiting...
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-400">
          {{ imageFile.name }} · {{ formatFileSize(imageFile.size) }}
          <template v-if="imageResult?.detection">
            · Detected at ({{ imageResult.detection.position.x }}, {{ imageResult.detection.position.y }})
            NCC={{ imageResult.detection.ncc.toFixed(3) }}
          </template>
        </p>

        <ProcessingStatus
          v-if="imageProcessing"
          stage="Processing image..."
          :percent="100"
          :active="true"
        />

        <div class="flex gap-3">
          <button
            class="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 disabled:opacity-50"
            :disabled="isBusy"
            @click="handleImageProcess"
          >
            {{ imageProcessing ? 'Processing...' : 'Remove Watermark' }}
          </button>
          <DownloadButton
            v-if="cleanedImageUrl"
            :url="cleanedImageUrl"
            :filename="`cleaned-${imageFile.name}`"
          >
            Download
          </DownloadButton>
          <button
            class="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
            @click="resetImageAll"
          >
            Reset
          </button>
        </div>
      </div>
    </template>

    <!-- Video mode -->
    <template v-if="mode === 'video'">
      <FileUploader
        v-if="!videoFile"
        accept="video/mp4"
        :disabled="isBusy || !videoSupport.supported"
        @select="onVideoSelect"
      >
        <template #hint>MP4 only — 1280×720, 720×1280, 1920×1080, or 1080×1920</template>
      </FileUploader>

      <!-- Video preview + actions -->
      <div v-else class="space-y-4">
        <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
          <video
            :src="videoPreviewUrl!"
            controls
            class="w-full rounded-lg"
            style="max-height: 360px;"
          />
        </div>

        <p class="text-xs text-gray-400">
          {{ videoFile.name }} · {{ formatFileSize(videoFile.size) }}
        </p>

        <ProcessingStatus
          :stage="stageLabel"
          :percent="progressPercent"
          :active="videoProcessing"
        />

        <div class="flex gap-3">
          <button
            class="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 disabled:opacity-50"
            :disabled="isBusy || !videoSupport.supported"
            @click="handleVideoProcess"
          >
            {{ videoProcessing ? 'Processing...' : 'Remove Watermark' }}
          </button>
          <DownloadButton
            v-if="videoDownloadUrl"
            :url="videoDownloadUrl"
            :filename="`cleaned-${videoFile.name}`"
          >
            Download
          </DownloadButton>
          <button
            class="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
            @click="resetVideoAll"
          >
            Reset
          </button>
        </div>
      </div>
    </template>

    <!-- Error display -->
    <div v-if="currentError" class="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
      {{ currentError }}
    </div>

    <!-- Footer -->
    <footer class="mt-16 text-center text-xs text-gray-300">
      <p>All processing happens in your browser. No files are uploaded to any server.</p>
    </footer>
  </div>
</template>
