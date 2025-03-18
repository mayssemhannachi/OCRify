<script setup lang="ts">
import { ref, provide } from 'vue'

const isOpen = ref(false)

provide('popover', {
  isOpen,
  toggle: () => isOpen.value = !isOpen.value,
  close: () => isOpen.value = false,
  open: () => isOpen.value = true
})
</script>

<template>
  <div class="relative inline-block">
    <slot />
  </div>
</template> 