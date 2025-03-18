<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps<{
  value: string
  disabled?: boolean
}>()

const selectedTab = inject('selectedTab') as { value: string }

const isSelected = computed(() => selectedTab.value === props.value)

function select() {
  if (!props.disabled) {
    selectedTab.value = props.value
  }
}
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="isSelected"
    :data-state="isSelected ? 'active' : 'inactive'"
    :disabled="disabled"
    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
    @click="select"
  >
    <slot />
  </button>
</template> 