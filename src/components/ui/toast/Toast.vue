<!-- Toast.vue -->
<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useToast } from './use-toast'
import Button from '../button/Button.vue'

const { toasts } = useToast()
</script>

<template>
  <div
    class="fixed bottom-0 right-0 z-50 flex flex-col gap-2 w-full max-w-md p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col"
    role="alert"
    aria-live="assertive"
  >
    <template v-for="toast in toasts" :key="toast.id">
      <div
        class="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all"
        :class="{
          'bg-background': toast.variant === 'default',
          'bg-destructive border-destructive text-destructive-foreground': toast.variant === 'destructive'
        }"
      >
        <div class="flex gap-2">
          <div class="flex flex-col gap-1">
            <div class="text-sm font-semibold">{{ toast.title }}</div>
            <div v-if="toast.description" class="text-sm opacity-90">
              {{ toast.description }}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          class="absolute right-2 top-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:opacity-100"
          @click="toasts.splice(toasts.indexOf(toast), 1)"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </template>
  </div>
</template> 