<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const checked = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    @click="checked = !checked"
    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-muted data-[state=checked]:bg-primary"
    :data-state="checked ? 'checked' : 'unchecked'"
  >
    <span
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out translate-x-0 data-[state=checked]:translate-x-5"
      :data-state="checked ? 'checked' : 'unchecked'"
    />
  </button>
</template> 