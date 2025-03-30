<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Toast from '@/components/ui/toast/Toast.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Router View -->
    <router-view></router-view>
    <Toast />
  </div>
</template>
