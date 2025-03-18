<script lang="ts">
export const description = 'A forgot password form with email input and code verification to reset password.'
export const iframeHeight = '600px'
export const containerClass = 'w-full h-screen flex items-center justify-center px-4'
</script>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/theme-toggle.vue'
import { CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const resetCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const step = ref(1) // 1: email, 2: code + new password, 3: success
const isSubmitting = ref(false)
const error = ref('')

const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value
})

const handleEmailSubmit = async (event: Event) => {
  event.preventDefault()
  isSubmitting.value = true
  error.value = ''
  
  try {
    // Add your email submission logic here
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    step.value = 2
  } catch (err) {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isSubmitting.value = false
  }
}

const handleResetSubmit = async (event: Event) => {
  event.preventDefault()
  if (!passwordsMatch.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    // Add your password reset logic here
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    step.value = 3
    
    // Reset after 3 seconds and redirect to sign in
    setTimeout(() => {
      router.push('/sign-in')
    }, 3000)
  } catch (err) {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isSubmitting.value = false
  }
}

const togglePasswordVisibility = (field: 'password' | 'confirm') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
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
          {{ step === 1 ? 'Mot de passe oublié' : step === 2 ? 'Réinitialisation' : 'Succès' }}
        </CardTitle>
        <CardDescription class="text-center text-base">
          {{ step === 1 
            ? 'Entrez votre email pour réinitialiser votre mot de passe' 
            : step === 2 
              ? 'Entrez le code reçu par email et votre nouveau mot de passe'
              : 'Votre mot de passe a été réinitialisé avec succès' 
          }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Step 1: Email Form -->
        <form v-if="step === 1" class="grid gap-6" @submit="handleEmailSubmit">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="exemple@email.com"
              class="w-full"
              required
              :disabled="isSubmitting"
            />
          </div>
          
          <div class="space-y-4">
            <Button type="submit" class="w-full text-base py-5" :disabled="isSubmitting">
              {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le code' }}
            </Button>
          </div>
        </form>

        <!-- Step 2: Reset Code + New Password Form -->
        <form v-if="step === 2" class="grid gap-6" @submit="handleResetSubmit">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="reset-code">Code de réinitialisation</Label>
              <Input
                id="reset-code"
                v-model="resetCode"
                type="text"
                placeholder="Entrez le code reçu par email"
                class="w-full font-mono"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div class="space-y-2">
              <Label for="new-password">Nouveau mot de passe</Label>
              <div class="relative">
                <Input
                  id="new-password"
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full pr-10"
                  required
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="togglePasswordVisibility('password')"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="confirm-password">Confirmer le mot de passe</Label>
              <div class="relative">
                <Input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full pr-10"
                  required
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="togglePasswordVisibility('confirm')"
                >
                  <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button type="submit" class="w-full text-base py-5" :disabled="isSubmitting || !passwordsMatch">
              {{ isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
            </Button>

            <!-- Error Message -->
            <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>

            <!-- Back Button -->
            <Button 
              type="button" 
              variant="ghost" 
              class="w-full" 
              :disabled="isSubmitting"
              @click="step = 1"
            >
              <ArrowLeft class="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </form>

        <!-- Step 3: Success Message -->
        <div v-if="step === 3" class="py-8 text-center space-y-4">
          <CheckCircle2 class="h-12 w-12 text-green-500 mx-auto" />
          <div class="space-y-2">
            <h3 class="text-lg font-medium">Mot de passe réinitialisé</h3>
            <p class="text-muted-foreground">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
          </div>
        </div>

        <div class="mt-6 text-center text-sm">
          Vous vous souvenez de votre mot de passe?
          <router-link to="/sign-in" class="text-primary hover:underline font-medium ml-1">
            Se connecter
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