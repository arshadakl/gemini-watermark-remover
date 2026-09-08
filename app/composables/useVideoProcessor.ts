/**
 * Vue composable for video watermark processing.
 *
 * Wraps the video processor with reactive state for UI integration.
 */

import { ref, computed } from 'vue'
import type { ProgressState, VideoProcessOptions } from '~/lib/types'
import { purifyVideo } from '~/lib/videoProcessor'

export function useVideoProcessor() {
  const isProcessing = ref(false)
  const progress = ref<ProgressState>({ stage: 'demux', ratio: 0 })
  const resultBlob = ref<Blob | null>(null)
  const error = ref<string | null>(null)

  const stageLabel = computed(() => {
    switch (progress.value.stage) {
      case 'demux': return 'Reading video...'
      case 'analyze': return 'Detecting watermark...'
      case 'process': return 'Removing watermark...'
      case 'mux': return 'Encoding output...'
      case 'done': return 'Done!'
      default: return 'Processing...'
    }
  })

  const progressPercent = computed(() => Math.round(progress.value.ratio * 100))

  async function process(
    arrayBuffer: ArrayBuffer,
    options: VideoProcessOptions = {},
  ): Promise<Blob | null> {
    isProcessing.value = true
    error.value = null
    resultBlob.value = null
    progress.value = { stage: 'demux', ratio: 0 }

    try {
      const blob = await purifyVideo(arrayBuffer, {
        onProgress: (p) => { progress.value = p },
        ...options,
      })
      resultBlob.value = blob
      return blob
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      console.error('[useVideoProcessor]', msg)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  function reset() {
    resultBlob.value = null
    error.value = null
    progress.value = { stage: 'demux', ratio: 0 }
  }

  return {
    isProcessing,
    progress,
    stageLabel,
    progressPercent,
    resultBlob,
    error,
    process,
    reset,
  }
}
