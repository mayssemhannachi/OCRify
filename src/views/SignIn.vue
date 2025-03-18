<script lang="ts">
export const description
  = 'A login form with email and password. There\'s an option to login with Google and a link to sign up if you don\'t have an account.'
export const iframeHeight = '600px'
export const containerClass = 'w-full h-screen flex items-center justify-center px-4'
</script>
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/theme-toggle.vue'

const router = useRouter()

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  // Add your authentication logic here
  
  // For now, just redirect to dashboard
  router.push('/dashboard')
}
</script>
<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-950 p-4">
    <!-- Grid Background -->
    <div 
      class="absolute inset-0 z-0 bg-white dark:bg-gray-950"
      style="
        background-image: 
          linear-gradient(to right, rgb(55 65 81 / 0.2) 1px, transparent 1px),
          linear-gradient(to bottom, rgb(55 65 81 / 0.2) 1px, transparent 1px);
        background-size: 24px 24px;
        mask-image: radial-gradient(ellipse 80% 50% at 50% -20%, black 90%, transparent 100%);
      "
    ></div>

    <Card class="w-full max-w-md relative z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border dark:border-gray-800">
      <div class="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <CardHeader class="space-y-2 pt-8 pb-4">
        <CardTitle class="text-3xl font-bold text-center">
          Bienvenue
        </CardTitle>
        <CardDescription class="text-center text-base">
          Connectez-vous à votre compte pour continuer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-6" @submit.prevent="handleSubmit">
          <div class="grid gap-3">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                class="w-full"
                required
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="password">Mot de passe</Label>
                <router-link to="/forgot-password" class="text-sm text-primary hover:underline">
                  Mot de passe oublié?
                </router-link>
              </div>
              <Input 
                id="password" 
                type="password" 
                class="w-full"
                required 
              />
            </div>
          </div>
          
          <div class="space-y-4">
            <Button type="submit" class="w-full text-base py-5">
              Se connecter
            </Button>
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-white dark:bg-gray-950 px-2 text-muted-foreground">Ou continuer avec</span>
              </div>
            </div>
            <Button variant="outline" class="w-full text-base py-5">
              <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 mr-2" />
              Google
            </Button>
          </div>
        </form>

        <div class="mt-6 text-center text-sm">
          Vous n'avez pas de compte?
          <router-link to="/sign-up" class="text-primary hover:underline font-medium ml-1">
            S'inscrire
          </router-link>
        </div>

        <div class="mt-4 text-center">
          <router-link to="/" class="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Retour à l'accueil
          </router-link>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.card-shadow {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
