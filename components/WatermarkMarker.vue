<script setup lang="ts">
import type { WatermarkRegion } from '~/lib/types'
import { clamp } from '~/lib/utils'

const props = defineProps<{
  src: string
  width: number
  height: number
  modelValue: WatermarkRegion
  disabled?: boolean
  /** Optional alpha map of the Gemini sparkle, drawn inside the marker as a guide. */
  overlayAlpha?: Float32Array | null
  /** Dimension of the overlay alpha map. */
  overlaySize?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', region: WatermarkRegion): void
  (e: 'change', region: WatermarkRegion): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const loadedImage = ref<HTMLImageElement | null>(null)
const loadedSrc = ref('')
const containerWidth = ref(0)
const containerHeight = ref(0)

const HANDLE_SIZE = 16
// Touch target for the resize handle (big enough for fingers on mobile).
const HANDLE_TOUCH = 44

type DragMode = 'move' | 'resize'
const dragMode = ref<DragMode | null>(null)
const startPointer = ref({ x: 0, y: 0 })
const startRegion = ref<WatermarkRegion>({ x: 0, y: 0, size: 0 })

let resizeObserver: ResizeObserver | null = null

const overlayCanvas = ref<HTMLCanvasElement | null>(null)

/**
 * Pre-render the sparkle alpha map into a small canvas so it can be drawn as a
 * translucent guide inside the marker without rebuilding it on every frame.
 */
function buildOverlayCanvas(): HTMLCanvasElement | null {
  const alpha = props.overlayAlpha
  const size = props.overlaySize
  if (!alpha || !size || size <= 0 || typeof document === 'undefined') return null
  if (alpha.length < size * size) return null

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const img = ctx.createImageData(size, size)
  for (let i = 0; i < size * size; i++) {
    const a = Math.max(0, Math.min(1, alpha[i]))
    const t = i * 4
    // Tint the guide cyan so it stays visible over both light and dark frames.
    img.data[t] = 0
    img.data[t + 1] = 224
    img.data[t + 2] = 255
    img.data[t + 3] = Math.round(a * 190)
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

watch(() => [props.overlayAlpha, props.overlaySize], () => {
  overlayCanvas.value = buildOverlayCanvas()
  draw()
}, { immediate: true })

const displaySize = computed(() => {
  const cw = containerWidth.value
  if (cw <= 0 || props.width <= 0 || props.height <= 0) {
    return { width: 0, height: 0 }
  }
  const width = cw
  const height = width * (props.height / props.width)
  return { width, height }
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

  // Sparkle guide overlay inside the marker
  if (overlayCanvas.value) {
    ctx.save()
    ctx.drawImage(overlayCanvas.value, mx, my, ms, ms)
    ctx.restore()
  }

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
    ctx.fillText(`${region.size}px`, mx + 4, Math.max(14, my - 6))
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const cssWidth = displaySize.value.width
  const cssHeight = displaySize.value.height
  // Skip drawing until the container has a real measured size.
  if (cssWidth <= 0 || cssHeight <= 0) return
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

const markerStyle = computed(() => {
  const r = props.modelValue
  return {
    left: `${toDisplayX(r.x)}px`,
    top: `${toDisplayY(r.y)}px`,
    width: `${toDisplaySize(r.size)}px`,
    height: `${toDisplaySize(r.size)}px`,
  }
})

const handleStyle = computed(() => {
  const ht = HANDLE_TOUCH
  return {
    right: `${-ht / 2}px`,
    bottom: `${-ht / 2}px`,
    width: `${ht}px`,
    height: `${ht}px`,
  }
})

function beginDrag(mode: DragMode, event: PointerEvent) {
  if (props.disabled) return
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return

  event.preventDefault()
  event.stopPropagation()
  dragMode.value = mode
  startPointer.value = { x: event.clientX, y: event.clientY }
  startRegion.value = { ...props.modelValue }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onDragMove(event: PointerEvent) {
  if (!dragMode.value || !event.isPrimary) return
  event.preventDefault()

  const dx = event.clientX - startPointer.value.x
  const dy = event.clientY - startPointer.value.y

  if (dragMode.value === 'move') {
    updateRegion({
      x: toNaturalX(toDisplayX(startRegion.value.x) + dx),
      y: toNaturalY(toDisplayY(startRegion.value.y) + dy),
    })
  } else {
    const minDisplay = 16 * scale.value
    // Follow the dominant drag direction so both horizontal and vertical drags work.
    const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy
    const newSize = toNaturalSize(Math.max(minDisplay, toDisplaySize(startRegion.value.size) + delta))
    updateRegion({ size: newSize })
  }
}

function endDrag(event: PointerEvent) {
  if (!event.isPrimary) return
  dragMode.value = null
  const target = event.currentTarget as HTMLElement | null
  if (target?.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }
}

watch(() => [props.modelValue, props.src], () => {
  draw()
})

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (entry) {
      containerWidth.value = entry.contentRect.width
      containerHeight.value = entry.contentRect.height
      draw()
    }
  })
  if (containerRef.value) resizeObserver.observe(containerRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div ref="containerRef" class="relative w-full select-none">
    <!-- Canvas is visual-only so the page can still scroll on touch devices. -->
    <canvas
      ref="canvasRef"
      class="block w-full rounded-2xl"
      :class="disabled ? 'opacity-60' : ''"
    />

    <!-- Interaction layer: only the marker box captures drags. -->
    <div
      v-if="displaySize.width > 0"
      class="absolute cursor-move touch-none"
      :style="markerStyle"
      @pointerdown="beginDrag('move', $event)"
      @pointermove="onDragMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <div
        class="absolute touch-none"
        :style="handleStyle"
        @pointerdown="beginDrag('resize', $event)"
        @pointermove="onDragMove"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      />
    </div>
  </div>
</template>
