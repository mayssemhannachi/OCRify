<!-- src/views/Home.vue -->
<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import ThemeToggle from '@/components/theme-toggle.vue'
</script>

<template>
  <div class="relative min-h-screen bg-white dark:bg-gray-950">
    <!-- Grid Background -->
    <div 
      class="absolute inset-0 z-0 bg-white dark:bg-gray-950"
      style="
        background-image: 
          linear-gradient(to right, rgb(55 65 81 / 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgb(55 65 81 / 0.3) 1px, transparent 1px);
        background-size: 24px 24px;
        mask-image: radial-gradient(ellipse 80% 50% at 50% -10%, black 40%, transparent 80%);
      "
    ></div>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center pt-56">
      <h2 class="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 inline-block text-transparent bg-clip-text animate-fade-in transform hover:scale-105 transition-transform duration-200">OCRify</h2>
      <h1 class="bg-gradient-to-r text-center from-blue-600 via-blue-800 to-purple-800 dark:from-blue-400 dark:via-blue-600 dark:to-purple-600 font-bold text-6xl inline-block text-transparent bg-clip-text pb-4">
        Le système intelligent <br />de gestion documentaire.
      </h1>
      <div class="h-4"></div>
      <p class="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-xl text-center">
        Notre système GED transforme votre flux de documents avec&nbsp;l'OCR alimenté par l'IA, des capacités de recherche intelligente&nbsp;et un stockage cloud sécurisé.
      </p>
      <div class="space-x-4">
        <router-link to="/sign-in">
          <Button variant="default" size="lg">Commencer</Button>
        </router-link>
        <a href="https://start-saas.com?utm=normalhuman" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg">En savoir plus</Button>
        </a>
      </div>

      <!-- Features Section -->
      <div class="mt-12 max-w-5xl mx-auto">
        <h2 class="text-2xl font-semibold mb-4 text-center">Découvrez la puissance de :</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white dark:bg-gray-900 border rounded-lg shadow-md p-6">
            <h3 class="text-xl font-semibold mb-2">OCR alimenté par l'IA</h3>
            <p class="text-muted-foreground">Convertissez les images et les PDF en texte modifiable grâce à la technologie IA avancée.</p>
          </div>
          <div class="bg-white dark:bg-gray-900 border rounded-lg shadow-md p-6">
            <h3 class="text-xl font-semibold mb-2">Recherche intelligente</h3>
            <p class="text-muted-foreground">Trouvez instantanément des documents avec des capacités de recherche et de filtrage intelligentes.</p>
          </div>
          <div class="bg-white dark:bg-gray-900 border rounded-lg shadow-md p-6">
            <h3 class="text-xl font-semibold mb-2">Stockage cloud sécurisé</h3>
            <p class="text-muted-foreground">Accédez à vos fichiers partout avec une sécurité et un stockage cloud de niveau entreprise.</p>
          </div>
        </div>
      </div>

      <!-- Demo Image -->
      <img
        src="/demo.png"
        alt="Démo Gestion Documentaire"
        class="my-12 border rounded-md transition-all hover:shadow-2xl hover:scale-[102%] shadow-xl w-[70vw] h-auto"
      />

      <!-- Auth Links and Theme Toggle -->
      <div class="flex items-center space-x-4 mb-10">
        <router-link to="/sign-in" class="text-sm hover:underline">Se connecter</router-link>
        <router-link to="/sign-up" class="text-sm hover:underline">S'inscrire</router-link>
        <ThemeToggle />
      </div>
    </div>
  </div>
</template> 