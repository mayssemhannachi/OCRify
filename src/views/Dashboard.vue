<!-- src/views/Dashboard.vue -->
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/theme-toggle.vue'
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <div class="flex h-screen">
      <!-- Sidebar -->
      <aside class="w-64 border-r bg-white dark:bg-gray-900">
        <div class="flex h-16 items-center border-b px-6">
          <h2 class="text-lg font-semibold">GED System</h2>
        </div>
        <nav class="space-y-1 p-4">
          <router-link
            to="/dashboard"
            class="flex items-center space-x-3 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span>Tableau de bord</span>
          </router-link>
          <router-link
            to="/dashboard/documents"
            class="flex items-center space-x-3 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span>Documents</span>
          </router-link>
          <router-link
            to="/dashboard/ocr"
            class="flex items-center space-x-3 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span>OCR</span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
        <!-- Header -->
        <header class="flex h-16 items-center justify-between border-b px-6 bg-white dark:bg-gray-900">
          <h1 class="text-2xl font-semibold">Tableau de bord</h1>
          <div class="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" @click="$router.push('/')">
              Se déconnecter
            </Button>
          </div>
        </header>

        <!-- Dashboard Content -->
        <div class="p-6">
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <!-- Stats Cards -->
            <div class="rounded-lg border bg-white dark:bg-gray-900 p-6">
              <h3 class="text-lg font-semibold">Documents totaux</h3>
              <p class="text-3xl font-bold">0</p>
            </div>
            <div class="rounded-lg border bg-white dark:bg-gray-900 p-6">
              <h3 class="text-lg font-semibold">Documents traités</h3>
              <p class="text-3xl font-bold">0</p>
            </div>
            <div class="rounded-lg border bg-white dark:bg-gray-900 p-6">
              <h3 class="text-lg font-semibold">Espace utilisé</h3>
              <p class="text-3xl font-bold">0 MB</p>
            </div>
          </div>

          <!-- Recent Documents -->
          <div class="mt-8">
            <h2 class="text-2xl font-semibold mb-4">Documents récents</h2>
            <div class="rounded-lg border bg-white dark:bg-gray-900">
              <div class="p-4">
                <p class="text-center text-muted-foreground">
                  Aucun document récent
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template> 