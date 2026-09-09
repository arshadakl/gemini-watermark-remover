<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  originalSrc: string
  cleanedSrc: string
  originalAlt?: string
  cleanedAlt?: string
  initialPosition?: number
}>(), {
  originalAlt: 'Original image',
  cleanedAlt: 'Cleaned image',
  initialPosition: 50,
})

const container = ref<HTMLElement | null>(null)
const isDragging = ref(false)

function clamp(value: number) {
  return Math.min(100, Math.max(0, value))
}

const position = ref(clamp(props.initialPosition))
const originalClipStyle = computed(() => ({
  clipPath: `inset(0 ${100 - position.value}% 0 0)`,
}))

function setPositionFromClientX(clientX: number) {
  const bounds = container.value?.getBoundingClientRect()
  if (!bounds?.width) return

  position.value = clamp(((clientX - bounds.left) / bounds.width) * 100)
}

function onPointerDown(event: PointerEvent) {
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return

  isDragging.value = true
  container.value?.setPointerCapture(event.pointerId)
  setPositionFromClientX(event.clientX)
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value || !event.isPrimary) return

  event.preventDefault()
  setPositionFromClientX(event.clientX)
}

function stopDragging(event: PointerEvent) {
  if (!event.isPrimary) return

  isDragging.value = false
  if (container.value?.hasPointerCapture(event.pointerId)) {
    container.value.releasePointerCapture(event.pointerId)
  }
}

function onKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 10 : 1
  const nextPosition = {
    ArrowLeft: position.value - step,
    ArrowDown: position.value - step,
    ArrowRight: position.value + step,
    ArrowUp: position.value + step,
    PageDown: position.value - 10,
    PageUp: position.value + 10,
    Home: 0,
    End: 100,
  }[event.key]

  if (nextPosition === undefined) return

  event.preventDefault()
  position.value = clamp(nextPosition)
}

watch(
  () => [props.originalSrc, props.cleanedSrc, props.initialPosition],
  () => {
    position.value = clamp(props.initialPosition)
    isDragging.value = false
  },
)
</script>

<template>
  <div
    ref="container"
    class="relative w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl border border-white/10 bg-black/40"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="stopDragging"
    @pointercancel="stopDragging"
  >
    <img
      :src="cleanedSrc"
      :alt="cleanedAlt"
      class="block max-h-[500px] w-full pointer-events-none object-contain"
      draggable="false"
    />

    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      :style="originalClipStyle"
    >
      <img
        :src="originalSrc"
        :alt="originalAlt"
        class="absolute inset-0 h-full w-full object-contain"
        draggable="false"
      />
    </div>

    <span class="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
      Original
    </span>
    <span class="pointer-events-none absolute right-3 top-3 z-20 rounded-full border border-brand-500/30 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-400 backdrop-blur-sm">
      Cleaned
    </span>

    <div
      class="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-brand-400 shadow-[0_0_12px_rgba(163,230,53,0.45)]"
      :style="{ left: `${position}%` }"
    />

    <button
      type="button"
      role="slider"
      aria-label="Compare original and cleaned images"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(position)"
      class="absolute top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brand-300/60 bg-[#101a0d] text-brand-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      :style="{ left: `${position}%` }"
      @keydown="onKeydown"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m8 9-3 3 3 3m8-6 3 3-3 3" />
      </svg>
    </button>

    <span
      v-if="isDragging"
      class="pointer-events-none absolute bottom-3 z-20 -translate-x-1/2 rounded-md bg-black/75 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm"
      :style="{ left: `${position}%` }"
      aria-hidden="true"
    >
      {{ Math.round(position) }}%
    </span>
  </div>
</template>
