<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value?: number
  max?: number
  customClass?: string | object
}>()

const progress = computed(() => {
  const value = props.value ?? 0
  const max = props.max ?? 100
  return Math.min(Math.max(0, (value / max) * 100), 100)
})
</script>

<template>
  <div
    class="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="max ?? 100"
    :aria-valuenow="value"
  >
    <div
      class="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
      :style="{ transform: `translateX(-${100 - progress}%)` }"
      :class="typeof customClass === 'string' ? customClass : ''"
    ></div>
  </div>
</template>