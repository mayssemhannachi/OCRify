<script setup lang="ts">
import { provide, ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
  defaultValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectedTab = ref(props.modelValue || props.defaultValue || '')

watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    selectedTab.value = newValue
  }
})

provide('selectedTab', selectedTab)

watch(selectedTab, (value) => {
  emit('update:modelValue', value)
})
</script>

<template>
  <div class="tabs">
    <slot />
  </div>
</template> 