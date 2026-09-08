<script setup lang="ts">
/**
 * Processing status display with stage label and progress bar.
 */

defineProps<{
  /** Current stage label. */
  stage: string
  /** Progress percentage 0-100. */
  percent: number
  /** Whether processing is active. */
  active: boolean
}>()
</script>

<template>
  <div v-if="active || percent > 0" class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-sm font-medium text-gray-700">{{ stage }}</span>
      <span class="text-xs font-semibold text-brand-600">{{ percent }}%</span>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        class="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500 transition-all duration-300"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
