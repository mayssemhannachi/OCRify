<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavFavorites from '@/components/NavFavorites.vue'
import NavMain from '@/components/NavMain.vue'
import NavSecondary from '@/components/NavSecondary.vue'
import NavWorkspaces from '@/components/NavWorkspaces.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  FileText,
  Home,
  Settings,
  FolderOpen,
  Search,
  History,
  HelpCircle,
  FileImage,
  FolderSearch,
} from 'lucide-vue-next'

const router = useRouter()
const currentRoute = ref(router.currentRoute.value.path)

// App info
const appInfo = {
  name: 'OCRify',
  logo: FileText,
}

// Main navigation items
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
]

// Secondary navigation
const secondaryItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    url: '/help',
    icon: HelpCircle,
  },
]

// Recent documents
const favorites = [
  {
    name: 'Invoice-2024-03.pdf',
    url: '#',
    emoji: '📄',
  },
  {
    name: 'Contract-Template.pdf',
    url: '#',
    emoji: '📝',
  },
  {
    name: 'Scan-20240307.jpg',
    url: '#',
    emoji: '🖼️',
  },
]

// Document categories
const workspaces = [
  {
    name: 'Document Types',
    emoji: '📁',
    pages: [
      {
        name: 'Invoices & Receipts',
        url: '#',
        emoji: '💰',
      },
      {
        name: 'Contracts & Legal',
        url: '#',
        emoji: '⚖️',
      },
      {
        name: 'Reports & Analysis',
        url: '#',
        emoji: '📊',
      },
    ],
  },
  {
    name: 'Quick Actions',
    emoji: '⚡',
    pages: [
      {
        name: 'Scan New Document',
        url: '#',
        emoji: '📸',
      },
      {
        name: 'Batch Processing',
        url: '#',
        emoji: '🔄',
      },
      {
        name: 'Export Documents',
        url: '#',
        emoji: '📤',
      },
    ],
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
      <NavMain :items="navItems" />
    </SidebarHeader>
    <SidebarContent>
      <NavFavorites :favorites="favorites" />
      <NavWorkspaces :workspaces="workspaces" />
      <NavSecondary :items="secondaryItems" class="mt-auto" />
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
