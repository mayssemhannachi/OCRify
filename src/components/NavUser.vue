<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
import Button from '@/components/ui/button/Button.vue'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Loader2,
  Sparkles,
} from 'lucide-vue-next'

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

const handleLogout = async () => {
  isLoggingOut.value = true
  // Here you would typically make an API call to logout
  // Simulating API call with timeout
  await new Promise(resolve => setTimeout(resolve, 1000))
  showLogoutDialog.value = false
  router.push('/')
}
</script>

<template>
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
            <DropdownMenuItem>
              <Sparkles class="mr-2 h-4 w-4" />
              <span>Mise à niveau Pro</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck class="mr-2 h-4 w-4" />
              <span>Compte</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard class="mr-2 h-4 w-4" />
              <span>Facturation</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell class="mr-2 h-4 w-4" />
              <span>Notifications</span>
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
