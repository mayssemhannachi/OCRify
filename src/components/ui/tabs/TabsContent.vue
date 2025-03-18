<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps<{
  value: string
}>()

const selectedTab = inject('selectedTab') as { value: string }

const isSelected = computed(() => selectedTab.value === props.value)
</script>

<template>
  <div
    role="tabpanel"
    :tabindex="isSelected ? 0 : -1"
    :aria-hidden="!isSelected"
    :data-state="isSelected ? 'active' : 'inactive'"
    class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    v-show="isSelected"
  >
    <slot />
  </div>
</template> 