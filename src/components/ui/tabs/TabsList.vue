<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>
<template>
  <div class="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground" :class="class">
    <slot></slot>
  </div>
</template> 