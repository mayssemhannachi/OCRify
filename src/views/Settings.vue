<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Bell,
  Moon,
  Sun,
  Languages,
  Save,
  Trash2,
  UserCircle,
  Mail,
  Lock,
  Database,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Switch from '@/components/ui/switch/Switch.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import SidebarLeft from '@/components/SidebarLeft.vue'

const route = useRoute()

// Settings state
const settings = ref({
  notifications: {
    emailNotifications: true,
    processingComplete: true,
    securityAlerts: true
  },
  appearance: {
    darkMode: false,
    compactMode: false
  },
  language: 'fr',
  storage: {
    autoDelete: true,
    compressionEnabled: true
  }
})

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' }
]

const handleSave = () => {
  // Implement settings save logic
  console.log('Saving settings:', settings.value)
}
</script>

<template>
  <SidebarProvider>
    <SidebarLeft />
    <SidebarInset>
      <header class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div class="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Paramètres</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col gap-6 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Paramètres</h1>
            <p class="text-muted-foreground mt-1">Gérez vos préférences et configurations</p>
          </div>
          <Button @click="handleSave">
            <Save class="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>

        <!-- Notifications -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Bell class="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Gérez vos préférences de notification</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Notifications par email</p>
                <p class="text-sm text-muted-foreground">Recevoir des mises à jour par email</p>
              </div>
              <Switch v-model="settings.notifications.emailNotifications" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Traitement terminé</p>
                <p class="text-sm text-muted-foreground">Notification lorsqu'un document est traité</p>
              </div>
              <Switch v-model="settings.notifications.processingComplete" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Alertes de sécurité</p>
                <p class="text-sm text-muted-foreground">Notifications de connexion suspecte</p>
              </div>
              <Switch v-model="settings.notifications.securityAlerts" />
            </div>
          </CardContent>
        </Card>

        <!-- Appearance -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Sun class="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Mode sombre</p>
                <p class="text-sm text-muted-foreground">Basculer le thème sombre</p>
              </div>
              <Switch v-model="settings.appearance.darkMode" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Mode compact</p>
                <p class="text-sm text-muted-foreground">Réduire l'espacement des éléments</p>
              </div>
              <Switch v-model="settings.appearance.compactMode" />
            </div>
          </CardContent>
        </Card>

        <!-- Language -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Languages class="h-5 w-5" />
              Langue
            </CardTitle>
            <CardDescription>Choisissez la langue de l'interface</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              v-model="settings.language"
              class="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                {{ lang.label }}
              </option>
            </select>
          </CardContent>
        </Card>

        <!-- Storage -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Database class="h-5 w-5" />
              Stockage
            </CardTitle>
            <CardDescription>Gérez les paramètres de stockage</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Suppression automatique</p>
                <p class="text-sm text-muted-foreground">Supprimer les documents de la corbeille après 30 jours</p>
              </div>
              <Switch v-model="settings.storage.autoDelete" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Compression</p>
                <p class="text-sm text-muted-foreground">Compresser les documents pour économiser de l'espace</p>
              </div>
              <Switch v-model="settings.storage.compressionEnabled" />
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template> 