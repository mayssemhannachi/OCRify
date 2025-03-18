<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  class?: string
}>()

const popover = inject('popover') as {
  isOpen: { value: boolean }
  close: () => void
}

const contentRef = ref<HTMLElement | null>(null)

onClickOutside(contentRef, () => {
  popover.close()
})

// Close on escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    popover.close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="popover.isOpen.value"
      ref="contentRef"
      class="absolute z-50 w-72 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      :class="props.class"
    >
      <slot />
    </div>
  </Transition>
</template> 