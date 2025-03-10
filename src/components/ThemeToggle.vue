<script setup lang="ts">
import { ref } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  const html = document.documentElement
  html.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme
if (typeof window !== 'undefined') {
  isDark.value = document.documentElement.classList.contains('dark') ||
    (localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches))
  
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleTheme"
    class="h-9 w-9"
  >
    <Sun v-if="isDark" class="h-4 w-4" />
    <Moon v-else class="h-4 w-4" />
    <span class="sr-only">Basculer le thème</span>
  </Button>
</template> 