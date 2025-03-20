<!-- src/views/SignUp.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ThemeToggle from '@/components/theme-toggle.vue'
import { auth } from '@/services/api'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(false)

// Add password requirements check
const passwordRequirements = {
  hasUpperCase: (password: string) => /[A-Z]/.test(password),
  hasLowerCase: (password: string) => /[a-z]/.test(password),
  hasNumber: (password: string) => /[0-9]/.test(password),
  hasSpecialChar: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  hasMinLength: (password: string) => password.length >= 8
}

const getPasswordRequirements = computed(() => {
  const password = formData.value.password
  return {
    hasUpperCase: passwordRequirements.hasUpperCase(password),
    hasLowerCase: passwordRequirements.hasLowerCase(password),
    hasNumber: passwordRequirements.hasNumber(password),
    hasSpecialChar: passwordRequirements.hasSpecialChar(password),
    hasMinLength: passwordRequirements.hasMinLength(password)
  }
})

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = ''
  success.value = ''
  
  // Check password requirements before submitting
  const requirements = getPasswordRequirements.value
  if (!Object.values(requirements).every(Boolean)) {
    error.value = 'Le mot de passe ne respecte pas les critères de sécurité'
    return
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    loading.value = true
    console.log('Attempting registration with:', {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      password: formData.value.password
    })
    
    const response = await auth.register({
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      password: formData.value.password
    })

    console.log('Registration response:', response.data)

    // Store the token if returned
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token)
    }

    success.value = 'Inscription réussie! Redirection vers la page de connexion...'
    
    // Wait 2 seconds before redirecting to show the success message
    setTimeout(() => {
      router.push('/sign-in')
    }, 2000)
  } catch (err: any) {
    console.error('Registration error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })
    
    // Display the exact error message from the backend
    if (err.response?.status === 400) {
      // If we get a 400 error and there's an email in the form, it's likely a duplicate email
      if (formData.value.email) {
        error.value = 'Cette adresse email est déjà utilisée'
      } else {
        error.value = err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
      }
    } else {
      error.value = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
    }
  } finally {
    loading.value = false
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
          Créer un compte
        </CardTitle>
        <CardDescription class="text-center text-base whitespace-nowrap">
          Inscrivez-vous&nbsp;pour&nbsp;commencer&nbsp;à&nbsp;gérer&nbsp;vos&nbsp;documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handleSubmit" class="grid gap-6">
          <div v-if="error" class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
            {{ error }}
          </div>
          
          <div v-if="success" class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
            {{ success }}
          </div>
          
          <div class="grid gap-3">
            <div class="grid gap-3 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  placeholder="Jean"
                  class="w-full"
                  required
                />
              </div>
              <div class="space-y-2">
                <Label for="lastName">Nom</Label>
                <Input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  placeholder="Dupont"
                  class="w-full"
                  required
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="exemple@email.com"
                class="w-full"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="password">Mot de passe</Label>
              <div class="relative">
                <Input 
                  id="password" 
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'" 
                  class="w-full pr-10"
                  required 
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <!-- Add password requirements display -->
              <div class="text-sm space-y-1 mt-1">
                <p class="text-muted-foreground">Le mot de passe doit contenir :</p>
                <ul class="space-y-1">
                  <li class="flex items-center gap-2">
                    <span :class="getPasswordRequirements.hasUpperCase ? 'text-green-500' : 'text-red-500'">•</span>
                    <span :class="getPasswordRequirements.hasUpperCase ? 'text-green-500' : 'text-muted-foreground'">
                      Au moins une majuscule
                    </span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span :class="getPasswordRequirements.hasLowerCase ? 'text-green-500' : 'text-red-500'">•</span>
                    <span :class="getPasswordRequirements.hasLowerCase ? 'text-green-500' : 'text-muted-foreground'">
                      Au moins une minuscule
                    </span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span :class="getPasswordRequirements.hasNumber ? 'text-green-500' : 'text-red-500'">•</span>
                    <span :class="getPasswordRequirements.hasNumber ? 'text-green-500' : 'text-muted-foreground'">
                      Au moins un chiffre
                    </span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span :class="getPasswordRequirements.hasSpecialChar ? 'text-green-500' : 'text-red-500'">•</span>
                    <span :class="getPasswordRequirements.hasSpecialChar ? 'text-green-500' : 'text-muted-foreground'">
                      Au moins un caractère spécial (!@#$%^&*(),.?":{}|<>)
                    </span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span :class="getPasswordRequirements.hasMinLength ? 'text-green-500' : 'text-red-500'">•</span>
                    <span :class="getPasswordRequirements.hasMinLength ? 'text-green-500' : 'text-muted-foreground'">
                      Au moins 8 caractères
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="confirmPassword">Confirmer le mot de passe</Label>
              <div class="relative">
                <Input 
                  id="confirmPassword" 
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  class="w-full pr-10"
                  required 
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
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
              {{ loading ? 'Inscription en cours...' : 'S\'inscrire' }}
            </Button>
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-white dark:bg-gray-950 px-2 text-muted-foreground">Ou continuer avec</span>
              </div>
            </div>
            <Button variant="outline" class="w-full text-base py-5" :disabled="loading">
              <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 mr-2" />
              Google
            </Button>
          </div>
        </form>

        <div class="mt-6 text-center text-sm">
          Vous avez déjà un compte?
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