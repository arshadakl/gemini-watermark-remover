/**
 * Vue composable for image watermark processing.
 *
 * Wraps the image processor with reactive state for UI integration.
 */

import { ref, shallowRef } from 'vue'
import type { ImageProcessOptions, ImageProcessResult, WatermarkDetection } from '~/lib/types'
import { purifyImage } from '~/lib/imageProcessor'

export function useImageProcessor() {
  const isProcessing = ref(false)
  const result = shallowRef<ImageProcessResult | null>(null)
  const error = ref<string | null>(null)
  const detection = shallowRef<WatermarkDetection | null>(null)

  async function process(
    source: HTMLImageElement | ImageData,
    options: ImageProcessOptions = {},
  ): Promise<ImageProcessResult | null> {
    isProcessing.value = true
    error.value = null
    result.value = null
    detection.value = null

    try {
      let imageData: ImageData

      if (source instanceof ImageData) {
        imageData = source
      } else {
        const canvas = document.createElement('canvas')
        canvas.width = source.naturalWidth
        canvas.height = source.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(source, 0, 0)
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      }

      const res = await purifyImage(imageData, options)
      result.value = res
      detection.value = res.detection ?? null
      return res
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      console.error('[useImageProcessor]', msg)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  function reset() {
    result.value = null
    error.value = null
    detection.value = null
  }

  return {
    isProcessing,
    result,
    error,
    detection,
    process,
    reset,
  }
}
