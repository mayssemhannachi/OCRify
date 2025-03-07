<!-- src/components/theme-toggle.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'

const theme = ref(localStorage.getItem('theme') || 'light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

watch(theme, (newTheme) => {
  localStorage.setItem('theme', newTheme)
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })
</script>

<template>
  <button
    @click="toggleTheme"
    class="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
  >
    <Sun v-if="theme === 'dark'" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </button>
</template> 