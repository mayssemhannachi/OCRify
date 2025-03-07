<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import {
  FileText,
  Home,
  Settings,
  FolderOpen,
} from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'

const router = useRouter()
const currentRoute = ref(router.currentRoute.value.path)

// App info
const appInfo = {
  name: 'OCRify',
  logo: FileText,
}

// Navigation items
const navItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
    isActive: currentRoute.value === '/',
  },
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: FolderOpen,
    isActive: currentRoute.value === '/dashboard',
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    isActive: currentRoute.value === '/settings',
  },
]
</script>

<template>
  <Sidebar class="border-r">
    <SidebarHeader>
      <div class="flex items-center gap-2 p-4">
        <component :is="appInfo.logo" class="h-6 w-6 text-primary" />
        <span class="font-semibold">{{ appInfo.name }}</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="navItems" />
    </SidebarContent>
  </Sidebar>
</template>
