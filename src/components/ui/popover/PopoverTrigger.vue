<script setup lang="ts">
import { inject } from 'vue'

defineProps<{
  asChild?: boolean
}>()

const popover = inject('popover') as {
  toggle: () => void
}
</script>

<template>
  <div @click="popover.toggle">
    <slot />
  </div>
</template> 