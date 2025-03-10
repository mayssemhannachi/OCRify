<script setup lang="ts">
import Calendars from '@/components/Calendars.vue'
import DatePicker from '@/components/DatePicker.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  type SidebarProps,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'none',
})
</script>

<template>
  <Sidebar
    class="sticky hidden lg:flex top-0 h-svh border-l"
    v-bind="props"
  >
    <SidebarHeader class="h-16 border-b border-sidebar-border">
      <div class="flex items-center justify-between p-4">
        <h2 class="text-lg font-semibold">Détails</h2>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <!-- Add your document details content here -->
    </SidebarContent>
  </Sidebar>
</template>
