<script setup lang="ts">
/**
 * Reusable download button that triggers a Blob download.
 */

const props = defineProps<{
  /** The Blob to download. */
  blob: Blob | null
  /** Suggested filename including extension. */
  filename: string
  /** Whether the button is disabled. */
  disabled?: boolean
}>()

function download() {
  if (!props.blob || props.disabled) return
  const url = URL.createObjectURL(props.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <button
    :disabled="disabled || !blob"
    class="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
    :class="blob && !disabled
      ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-md hover:shadow-lg hover:from-brand-600 hover:to-brand-700 active:scale-[0.98]'
      : 'bg-gray-300'"
    @click="download"
  >
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
    <slot>Download</slot>
  </button>
</template>
