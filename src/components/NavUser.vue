<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/services/api'
import { AuthService } from '@/services/auth-service'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  User,
  LogOut,
  Loader2,
  Save,
  ChevronsUpDown,
  Upload,
  Bell,
  Languages,
  Moon,
  Phone,
  MapPin,
  Building,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  user: {
    name: string
    email: string
    avatar: string
  }
}>()

const router = useRouter()
const { isMobile } = useSidebar()
const isLoggingOut = ref(false)
const showLogoutDialog = ref(false)
const showProfileDialog = ref(false)
const activeTab = ref('general')

// Profile form data
const profileForm = ref({
  // Personal Information
  name: props.user.name,
  email: props.user.email,
  phone: '',
  address: '',
  company: '',
  birthDate: '',
  avatar: props.user.avatar,
  
  // Security
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false,
  currentPassword: '',
})

const avatarOptions = [
  { id: 1, url: '/avatars/professional-1.png' },
  { id: 2, url: '/avatars/professional-2.png' },
  { id: 3, url: '/avatars/professional-3.png' },
  { id: 4, url: '/avatars/professional-4.png' },
  { id: 5, url: '/avatars/professional-5.png' },
  { id: 6, url: '/avatars/professional-6.png' },
]

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

const isSaving = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

// Add these refs for password visibility
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Password validation functions
const hasMinLength = (password: string): boolean => password.length >= 8
const hasUpperCase = (password: string): boolean => /[A-Z]/.test(password)
const hasLowerCase = (password: string): boolean => /[a-z]/.test(password)
const hasNumber = (password: string): boolean => /\d/.test(password)
const hasSpecialChar = (password: string): boolean => /[@$!%*?&]/.test(password)

// Password validation function
const validatePassword = (password: string): boolean => {
  return hasMinLength(password) && 
         hasUpperCase(password) && 
         hasLowerCase(password) && 
         hasNumber(password) && 
         hasSpecialChar(password)
}

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    // Close the dialog first
    showLogoutDialog.value = false
    
    // Call the logout service
    await AuthService.logout()
    
    // The navigation will be handled by AuthService
    // No need to manually redirect
  } catch (error) {
    console.error('Logout error:', error)
    // If there's an error, we still want to clear the UI state
    showLogoutDialog.value = false
  } finally {
    isLoggingOut.value = false
  }
}

const handleSaveProfile = async () => {
  isSaving.value = true
  passwordError.value = ''
  passwordSuccess.value = false
  try {
    // If we're on the security tab and passwords are provided
    if (activeTab.value === 'security' && profileForm.value.newPassword) {
      // Validate password requirements
      if (!validatePassword(profileForm.value.newPassword)) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial')
      }

      // Validate passwords match
      if (profileForm.value.newPassword !== profileForm.value.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      // Call the change password API
      await auth.changePassword({
        currentPassword: profileForm.value.currentPassword,
        newPassword: profileForm.value.newPassword
      })

      // Clear password fields after successful change
      profileForm.value.newPassword = ''
      profileForm.value.confirmPassword = ''
      profileForm.value.currentPassword = ''
      
      // Show success message
      passwordSuccess.value = true
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        passwordSuccess.value = false
        showProfileDialog.value = false
      }, 3000)
    } else {
      // Close the dialog immediately for non-password changes
      showProfileDialog.value = false
    }
  } catch (error: any) {
    console.error('Error saving profile:', error)
    passwordError.value = error.message
  } finally {
    isSaving.value = false
  }
}

const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        profileForm.value.avatar = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeAvatar = () => {
  profileForm.value.avatar = ''
}

const selectAvatar = (avatarUrl: string) => {
  profileForm.value.avatar = avatarUrl
}
</script>

<template>
  <!-- Logout Confirmation Dialog -->
  <Dialog v-model:open="showLogoutDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Déconnexion</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir vous déconnecter ?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          @click="showLogoutDialog = false"
          :disabled="isLoggingOut"
        >
          Annuler
        </Button>
        <Button
          variant="destructive"
          @click="handleLogout"
          :disabled="isLoggingOut"
        >
          <Loader2 v-if="isLoggingOut" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoggingOut ? 'Déconnexion...' : 'Se déconnecter' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Profile Dialog -->
  <Dialog v-model:open="showProfileDialog">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Profil</DialogTitle>
        <DialogDescription>
          Gérez vos informations personnelles et vos préférences
        </DialogDescription>
      </DialogHeader>
      
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <form @submit.prevent="handleSaveProfile">
          <!-- General Tab -->
          <TabsContent value="general" class="space-y-4 mt-4">
            <!-- Avatar Upload -->
            <div class="space-y-4">
              <Label>Photo de profil</Label>
              <div class="flex items-center gap-4">
                <Avatar class="h-20 w-20">
                  <AvatarImage :src="profileForm.avatar" :alt="profileForm.name" />
                  <AvatarFallback>
                    {{ profileForm.name.split(' ').map(n => n[0]).join('') }}
                  </AvatarFallback>
                </Avatar>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger as-child>
                        <Button type="button" variant="outline" size="sm">
                          <Upload class="h-4 w-4 mr-2" />
                          Changer
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-80 p-3">
                        <div class="space-y-4">
                          <div class="space-y-2">
                            <h4 class="font-medium text-sm">Choisir un avatar</h4>
                            <div class="grid grid-cols-4 gap-2">
                              <Button
                                v-for="avatar in avatarOptions"
                                :key="avatar.id"
                                type="button"
                                variant="outline"
                                size="sm"
                                class="p-0 h-12 w-12"
                                @click="selectAvatar(avatar.url)"
                              >
                                <Avatar class="h-full w-full">
                                  <AvatarImage :src="avatar.url" :alt="'Avatar ' + avatar.id" />
                                  <AvatarFallback>{{ avatar.id }}</AvatarFallback>
                                </Avatar>
                              </Button>
                            </div>
                          </div>
                          <Separator />
                          <div class="space-y-2">
                            <h4 class="font-medium text-sm">Importer une image</h4>
                            <div class="flex items-center">
                              <input
                                type="file"
                                accept="image/*"
                                class="hidden"
                                id="avatar-upload"
                                @change="handleAvatarUpload"
                              />
                              <Button type="button" variant="outline" size="sm" class="w-full" as-child>
                                <label for="avatar-upload" class="flex items-center justify-center gap-2 cursor-pointer w-full">
                                  <Upload class="h-4 w-4" />
                                  Importer une photo
                                </label>
                              </Button>
                            </div>
                            <p class="text-xs text-muted-foreground">
                              PNG, JPG ou GIF. Taille maximale de 2MB.
                            </p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      @click="removeAvatar"
                      :disabled="!profileForm.avatar"
                    >
                      <Trash2 class="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="name">Nom complet</Label>
                <Input
                  id="name"
                  v-model="profileForm.name"
                  placeholder="Votre nom"
                  :disabled="isSaving"
                />
              </div>
              
              <div class="grid gap-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  v-model="profileForm.email"
                  placeholder="votre@email.com"
                  :disabled="isSaving"
                />
              </div>

              <div class="grid gap-2">
                <Label for="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  v-model="profileForm.phone"
                  placeholder="+33 6 12 34 56 78"
                  :disabled="isSaving"
                >
                  <template #prefix>
                    <Phone class="h-4 w-4 text-muted-foreground" />
                  </template>
                </Input>
              </div>

              <div class="grid gap-2">
                <Label for="address">Adresse</Label>
                <Input
                  id="address"
                  v-model="profileForm.address"
                  placeholder="Votre adresse"
                  :disabled="isSaving"
                >
                  <template #prefix>
                    <MapPin class="h-4 w-4 text-muted-foreground" />
                  </template>
                </Input>
              </div>

              <div class="grid gap-2">
                <Label for="company">Entreprise</Label>
                <Input
                  id="company"
                  v-model="profileForm.company"
                  placeholder="Nom de l'entreprise"
                  :disabled="isSaving"
                >
                  <template #prefix>
                    <Building class="h-4 w-4 text-muted-foreground" />
                  </template>
                </Input>
              </div>

              <div class="grid gap-2">
                <Label for="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  v-model="profileForm.birthDate"
                  :disabled="isSaving"
                >
                  <template #prefix>
                    <Calendar class="h-4 w-4 text-muted-foreground" />
                  </template>
                </Input>
              </div>
            </div>
          </TabsContent>

          <!-- Security Tab -->
          <TabsContent value="security" class="space-y-4 mt-4">
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="current-password">Mot de passe actuel</Label>
                <div class="relative">
                  <Input
                    id="current-password"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    v-model="profileForm.currentPassword"
                    placeholder="••••••••"
                    :disabled="isSaving"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <Eye v-if="!showCurrentPassword" class="h-4 w-4 text-muted-foreground" />
                    <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <div class="grid gap-2">
                <Label for="new-password">Nouveau mot de passe</Label>
                <div class="relative">
                  <Input
                    id="new-password"
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model="profileForm.newPassword"
                    placeholder="••••••••"
                    :disabled="isSaving"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <Eye v-if="!showNewPassword" class="h-4 w-4 text-muted-foreground" />
                    <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <p class="text-sm text-muted-foreground">
                  Le mot de passe doit contenir :
                  <ul class="space-y-1 mt-1">
                    <li class="flex items-center gap-2">
                      <svg
                        class="h-4 w-4"
                        :class="hasMinLength(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          v-if="hasMinLength(profileForm.newPassword)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span :class="hasMinLength(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'">
                        Au moins 8 caractères
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <svg
                        class="h-4 w-4"
                        :class="hasUpperCase(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          v-if="hasUpperCase(profileForm.newPassword)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span :class="hasUpperCase(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'">
                        Au moins une majuscule
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <svg
                        class="h-4 w-4"
                        :class="hasLowerCase(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          v-if="hasLowerCase(profileForm.newPassword)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span :class="hasLowerCase(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'">
                        Au moins une minuscule
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <svg
                        class="h-4 w-4"
                        :class="hasNumber(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          v-if="hasNumber(profileForm.newPassword)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span :class="hasNumber(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'">
                        Au moins un chiffre
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <svg
                        class="h-4 w-4"
                        :class="hasSpecialChar(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          v-if="hasSpecialChar(profileForm.newPassword)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span :class="hasSpecialChar(profileForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'">
                        Au moins un caractère spécial (@$!%*?&)
                      </span>
                    </li>
                  </ul>
                </p>
              </div>

              <div class="grid gap-2">
                <Label for="confirm-password">Confirmer le mot de passe</Label>
                <div class="relative">
                  <Input
                    id="confirm-password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="profileForm.confirmPassword"
                    placeholder="••••••••"
                    :disabled="isSaving"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <Eye v-if="!showConfirmPassword" class="h-4 w-4 text-muted-foreground" />
                    <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <div v-if="passwordError" class="text-sm text-destructive">
                {{ passwordError }}
              </div>

              <div v-if="passwordSuccess" class="flex items-center gap-2 text-sm text-green-600 animate-fade-in">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Mot de passe modifié avec succès !
              </div>

              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <Label>Authentification à deux facteurs</Label>
                  <p class="text-sm text-muted-foreground">
                    Ajouter une couche de sécurité supplémentaire à votre compte
                  </p>
                </div>
                <Switch v-model="profileForm.twoFactorEnabled" />
              </div>
            </div>
          </TabsContent>

          <DialogFooter class="mt-6">
            <Button type="submit" :disabled="isSaving">
              <Save v-if="!isSaving" class="mr-2 h-4 w-4" />
              <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </Button>
          </DialogFooter>
        </form>
      </Tabs>
    </DialogContent>
  </Dialog>

  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                {{ user.name.split(' ').map(n => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="start"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg">
                  {{ user.name.split(' ').map(n => n[0]).join('') }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @click="showProfileDialog = true">
              <User class="mr-2 h-4 w-4" />
              <span>Compte</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="showLogoutDialog = true">
            <LogOut class="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
