<script lang="ts">
export const description
  = 'A login form with email and password. There\'s an option to login with Google and a link to sign up if you don\'t have an account.'
export const iframeHeight = '600px'
export const containerClass = 'w-full h-screen flex items-center justify-center px-4'
</script>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useRoute } from 'vue-router'
import ThemeToggle from '@/components/theme-toggle.vue'
import { auth } from '@/services/api'
import { AuthService } from '@/services/auth-service'

const router = useRouter()
const route = useRoute()
const formData = ref({
  email: '',
  password: ''
})

const error = ref('')
const success = ref('')
const loading = ref(false)
const showPassword = ref(false)

// Check for reset success message
if (route.query.reset === 'success') {
  success.value = 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (loading.value) return
  
  // Store the current values
  const currentEmail = formData.value.email
  const currentPassword = formData.value.password
  
  try {
    loading.value = true
    success.value = ''
    
    try {
      const response = await auth.login({
        email: currentEmail,
        password: currentPassword
      })
      
      if (response.data.success && response.data.data?.token) {
        AuthService.setToken(response.data.data.token)
        const userData = {
          email: currentEmail,
          firstName: response.data.data.user?.firstName,
          lastName: response.data.data.user?.lastName,
          id: response.data.data.user?.id,
        }
        AuthService.setUser(userData)
        router.push('/dashboard')
      } else {
        error.value = response.data.message || 'Email ou mot de passe incorrect'
        // Restore the form data
        formData.value.email = currentEmail
        formData.value.password = currentPassword
      }
    } catch (loginError: any) {
      console.error('Login error:', loginError)
      // Translate error messages to French
      const errorMessage = loginError.response?.data?.message
      if (errorMessage) {
        if (errorMessage.includes('Invalid email or password')) {
          error.value = 'Email ou mot de passe incorrect'
        } else if (errorMessage.includes('Account is locked')) {
          error.value = 'Votre compte est verrouillé. Veuillez réessayer plus tard.'
        } else if (errorMessage.includes('Email not confirmed')) {
          error.value = 'Veuillez confirmer votre adresse email avant de vous connecter.'
        } else {
          error.value = errorMessage
        }
      } else {
        error.value = 'Email ou mot de passe incorrect'
      }
      // Restore the form data
      formData.value.email = currentEmail
      formData.value.password = currentPassword
    }
  } finally {
    loading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const clearError = () => {
  error.value = ''
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
        <form 
          class="grid gap-6" 
          @submit.prevent="handleSubmit"
          autocomplete="off"
          spellcheck="false"
          novalidate
        >
          <div v-if="error" class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
            {{ error }}
          </div>

          <div v-if="success" class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
            {{ success }}
          </div>

          <div class="grid gap-3">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="exemple@email.com"
                class="w-full"
                required
                :disabled="loading"
                spellcheck="false"
                autocomplete="off"
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="password">Mot de passe</Label>
                <router-link to="/forgot-password" class="text-sm text-primary hover:underline">
                  Mot de passe oublié?
                </router-link>
              </div>
              <div class="relative">
                <Input 
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full pr-10"
                  required
                  :disabled="loading"
                  spellcheck="false"
                  autocomplete="off"
                  @keyup.enter.prevent="handleSubmit"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  @click="togglePasswordVisibility"
                  tabindex="-1"
                >
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <Button 
              type="submit" 
              class="w-full text-base py-5"
              :disabled="loading"
            >
              {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
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

