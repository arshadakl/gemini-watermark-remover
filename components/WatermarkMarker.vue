<script setup lang="ts">
import type { WatermarkRegion } from '~/lib/types'
import { clamp } from '~/lib/utils'

const props = defineProps<{
  src: string
  width: number
  height: number
  modelValue: WatermarkRegion
  sizes: number[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', region: WatermarkRegion): void
  (e: 'change', region: WatermarkRegion): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const loadedImage = ref<HTMLImageElement | null>(null)
const loadedSrc = ref('')

const HANDLE_SIZE = 12

type DragMode = 'move' | 'resize'
const dragMode = ref<DragMode | null>(null)
const startPointer = ref({ x: 0, y: 0 })
const startRegion = ref<WatermarkRegion>({ x: 0, y: 0, size: 0 })

const displaySize = computed(() => {
  const el = containerRef.value
  if (!el) return { width: props.width, height: props.height }
  const rect = el.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
})

const scale = computed(() => {
  return props.width > 0 ? displaySize.value.width / props.width : 1
})

function toDisplayX(x: number) {
  return x * scale.value
}

function toDisplayY(y: number) {
  return y * scale.value
}

function toDisplaySize(s: number) {
  return s * scale.value
}

function toNaturalX(x: number) {
  return Math.round(x / scale.value)
}

function toNaturalY(y: number) {
  return Math.round(y / scale.value)
}

function toNaturalSize(s: number) {
  return Math.round(s / scale.value)
}

function clampRegion(region: Partial<WatermarkRegion>): WatermarkRegion {
  const size = Math.max(16, Math.min(region.size ?? props.modelValue.size, Math.min(props.width, props.height)))
  const x = clamp(region.x ?? props.modelValue.x, 0, props.width - size)
  const y = clamp(region.y ?? props.modelValue.y, 0, props.height - size)
  return { x, y, size }
}

function updateRegion(region: Partial<WatermarkRegion>) {
  const next = clampRegion(region)
  emit('update:modelValue', next)
  emit('change', next)
}

function setSize(size: number) {
  const current = props.modelValue
  // Keep center as close as possible when changing size.
  const cx = current.x + current.size / 2
  const cy = current.y + current.size / 2
  updateRegion({
    x: Math.round(cx - size / 2),
    y: Math.round(cy - size / 2),
    size,
  })
}

function renderFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cssWidth: number, cssHeight: number) {
  ctx.drawImage(img, 0, 0, cssWidth, cssHeight)

  const region = props.modelValue
  const mx = toDisplayX(region.x)
  const my = toDisplayY(region.y)
  const ms = toDisplaySize(region.size)

  // Dark overlay outside marker
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.beginPath()
  ctx.rect(0, 0, cssWidth, cssHeight)
  ctx.rect(mx, my, ms, ms)
  ctx.fill('evenodd')
  ctx.restore()

  // Marker border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.strokeRect(mx, my, ms, ms)
  ctx.setLineDash([])

  // Resize handle (bottom-right)
  const hs = HANDLE_SIZE
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.fillRect(mx + ms - hs / 2, my + ms - hs / 2, hs, hs)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  ctx.strokeRect(mx + ms - hs / 2, my + ms - hs / 2, hs, hs)

  // Label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.font = '12px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(`${region.size}×${region.size}`, mx + 4, Math.max(14, my - 6))
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const cssWidth = displaySize.value.width
  const cssHeight = displaySize.value.height
  canvas.width = Math.round(cssWidth * dpr)
  canvas.height = Math.round(cssHeight * dpr)
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Clear
  ctx.clearRect(0, 0, cssWidth, cssHeight)

  // Use cached image if available, otherwise load and cache it.
  if (loadedImage.value && loadedSrc.value === props.src) {
    renderFrame(ctx, loadedImage.value, cssWidth, cssHeight)
    return
  }

  const img = new Image()
  img.src = props.src
  img.onload = () => {
    loadedImage.value = img
    loadedSrc.value = props.src
    renderFrame(ctx, img, cssWidth, cssHeight)
  }
}

function hitTest(clientX: number, clientY: number): DragMode | null {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  const region = props.modelValue
  const mx = toDisplayX(region.x)
  const my = toDisplayY(region.y)
  const ms = toDisplaySize(region.size)
  const hs = HANDLE_SIZE

  // Bottom-right resize handle
  if (
    x >= mx + ms - hs &&
    x <= mx + ms + hs &&
    y >= my + ms - hs &&
    y <= my + ms + hs
  ) {
    return 'resize'
  }

  // Inside marker body
  if (x >= mx && x <= mx + ms && y >= my && y <= my + ms) {
    return 'move'
  }

  return null
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return

  const mode = hitTest(event.clientX, event.clientY)
  if (!mode) return

  event.preventDefault()
  dragMode.value = mode
  startPointer.value = { x: event.clientX, y: event.clientY }
  startRegion.value = { ...props.modelValue }
  canvasRef.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragMode.value || !event.isPrimary) return
  event.preventDefault()

  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dx = event.clientX - startPointer.value.x
  const dy = event.clientY - startPointer.value.y

  if (dragMode.value === 'move') {
    updateRegion({
      x: toNaturalX(toDisplayX(startRegion.value.x) + dx),
      y: toNaturalY(toDisplayY(startRegion.value.y) + dy),
    })
  } else if (dragMode.value === 'resize') {
    const minDisplay = 16 * scale.value
    const newSize = toNaturalSize(Math.max(minDisplay, toDisplaySize(startRegion.value.size) + Math.max(dx, dy)))
    updateRegion({ size: newSize })
  }
}

function onPointerUp(event: PointerEvent) {
  if (!event.isPrimary) return
  dragMode.value = null
  if (canvasRef.value?.hasPointerCapture(event.pointerId)) {
    canvasRef.value.releasePointerCapture(event.pointerId)
  }
}

watch(() => [props.modelValue, props.src, displaySize.value.width, displaySize.value.height], draw, { immediate: true })

onMounted(() => {
  window.addEventListener('resize', draw)
  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', draw)
})
</script>

<template>
  <div ref="containerRef" class="relative w-full select-none">
    <canvas
      ref="canvasRef"
      class="block w-full cursor-crosshair rounded-2xl"
      :class="disabled ? 'opacity-60' : ''"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
    />

    <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
      <button
        v-for="s in sizes"
        :key="s"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
        :class="modelValue.size === s
          ? 'border-brand-500 bg-brand-500 text-black'
          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'"
        :disabled="disabled"
        @click="setSize(s)"
      >
        {{ s }} px
      </button>
    </div>

    <p class="mt-2 text-center text-xs text-gray-400">
      Drag the box to move. Drag the bottom-right handle to resize.
    </p>
  </div>
</template>
