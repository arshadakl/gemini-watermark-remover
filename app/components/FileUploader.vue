<script setup lang="ts">
/**
 * Generic drag-and-drop file uploader.
 * Emits the selected File; validates accept filter client-side.
 */

const props = defineProps<{
  /** Comma-separated accept filter, e.g. "image/*" or "video/mp4". */
  accept: string
  /** Whether the uploader is disabled (e.g. during processing). */
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [file: File]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled) isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (props.disabled) return
  const file = e.dataTransfer?.files[0]
  if (file) emit('select', file)
}

function onClick() {
  if (!props.disabled) fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('select', file)
    input.value = '' // reset so same file can be re-selected
  }
}
</script>

<template>
  <div
    class="relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200"
    :class="[
      isDragging
        ? 'border-brand-400 bg-brand-50'
        : disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-brand-50/50',
    ]"
    @dragenter="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="onClick"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      :disabled="disabled"
      @change="onFileChange"
    />

    <div class="flex flex-col items-center gap-3">
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full"
        :class="isDragging ? 'bg-brand-100' : 'bg-gray-100'"
      >
        <svg class="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div>
        <p class="text-base font-semibold text-gray-700">
          {{ isDragging ? 'Drop your file here' : 'Drag & drop or click to upload' }}
        </p>
        <p class="mt-1 text-sm text-gray-400">
          <slot name="hint" />
        </p>
      </div>
    </div>
  </div>
</template>
