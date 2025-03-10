<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
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

const trashedDocuments = ref([
  {
    id: 1,
    name: 'facture-2024.pdf',
    deletedAt: '2024-03-07',
    size: '1.2 Mo',
  },
  {
    id: 2,
    name: 'contrat-client.pdf',
    deletedAt: '2024-03-06',
    size: '2.5 Mo',
  },
])

const showRestoreAlert = ref(false)

const handleRestore = (docId: number) => {
  trashedDocuments.value = trashedDocuments.value.filter(doc => doc.id !== docId)
  // Here you would typically make an API call to restore the document
}

const handleDelete = (docId: number) => {
  trashedDocuments.value = trashedDocuments.value.filter(doc => doc.id !== docId)
  // Here you would typically make an API call to permanently delete the document
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
                <BreadcrumbPage>Corbeille</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col p-6">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-semibold">Corbeille</h1>
            <p class="text-muted-foreground mt-1">Documents supprimés</p>
          </div>
        </div>

        <div class="space-y-4">
          <Card v-for="doc in trashedDocuments" :key="doc.id">
            <CardContent class="flex items-center justify-between p-4">
              <div class="flex items-center gap-4">
                <Trash2 class="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 class="font-medium">{{ doc.name }}</h3>
                  <p class="text-sm text-muted-foreground">
                    Supprimé le {{ doc.deletedAt }} · {{ doc.size }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" @click="handleRestore(doc.id)">
                  <RotateCcw class="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
                <Button variant="destructive" size="sm" @click="handleDelete(doc.id)">
                  <Trash2 class="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>

          <div v-if="trashedDocuments.length === 0" class="text-center py-12">
            <div class="flex justify-center mb-4">
              <AlertTriangle class="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-medium">Aucun document dans la corbeille</h3>
            <p class="text-muted-foreground mt-1">Les documents supprimés apparaîtront ici</p>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template> 