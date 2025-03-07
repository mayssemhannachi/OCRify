<!-- src/components/ui/Button.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const props = defineProps({
  variant: {
    type: String as PropType<'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'>,
    default: 'default',
  },
  size: {
    type: String as PropType<'default' | 'sm' | 'lg' | 'icon'>,
    default: 'default',
  },
  class: {
    type: String,
    default: '',
  },
})

const classes = computed(() => {
  return buttonVariants({ variant: props.variant, size: props.size, class: props.class })
})
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template> 