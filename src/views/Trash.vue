<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  X,
  Grid2x2,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
import { documents as documentsService } from '@/services/api'
import type { DocumentDto, BackendDocumentDto } from '@/types/documents'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const route = useRoute()
const { toast } = useToast()

const trashedDocuments = ref<DocumentDto[]>([])
const isLoading = ref(false)
const selectedDocuments = ref<string[]>([])
const isBulkMode = ref(false)

// Add formatFileSize helper function
const formatFileSize = (bytes: number): string => {
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

// Fetch trashed documents
const fetchTrashedDocuments = async () => {
  try {
    console.log('Fetching trashed documents...');
    isLoading.value = true;
    
    // Always include includeDeleted: true for the trash view
    const response = await documentsService.getAll({ 
      page: 1, 
      pageSize: 100,
      includeDeleted: true // Explicitly set to true for trash view
    });
    
    console.log('API response:', response);
    
    if (response.success && response.data) {
      console.log('Total documents received:', response.data.items.length);
      // Map backend documents to frontend documents
      trashedDocuments.value = response.data.items
        .filter((doc: BackendDocumentDto) => doc.isDeleted)
        .map((doc: BackendDocumentDto) => ({
          id: doc.id,
          name: doc.fileName,
          path: doc.filePath,
          size: doc.fileSize,
          type: doc.fileType,
          status: doc.status === 4 ? 'Complete' : doc.status === 0 ? 'Uploaded' : 'Deleted',
          language: doc.language,
          topic: doc.topic,
          description: doc.description,
          tags: doc.tags,
          isFavorite: doc.isFavorite,
          createdAt: doc.uploadDate,
          updatedAt: doc.lastModified || doc.uploadDate,
          accuracy: doc.accuracy,
          isDeleted: doc.isDeleted
        }));
      console.log('Filtered deleted documents:', trashedDocuments.value.length);
    }
  } catch (error) {
    console.error('Error fetching trashed documents:', error);
  } finally {
    isLoading.value = false;
  }
}

// Call fetchTrashedDocuments when component mounts
onMounted(() => {
  fetchTrashedDocuments()
})

const toggleBulkMode = () => {
  isBulkMode.value = !isBulkMode.value
  if (!isBulkMode.value) {
    selectedDocuments.value = []
  }
}

const toggleDocumentSelection = (docId: string) => {
  const index = selectedDocuments.value.indexOf(docId)
  if (index === -1) {
    selectedDocuments.value.push(docId)
  } else {
    selectedDocuments.value.splice(index, 1)
  }
}

const isDocumentSelected = (docId: string) => {
  return selectedDocuments.value.includes(docId)
}

const handleRestore = async (docId: string) => {
  try {
    const response = await documentsService.restore(docId)
    if (response.success) {
      toast({
        title: 'Document restauré',
        description: 'Le document a été restauré avec succès.',
      })
      await fetchTrashedDocuments()
    } else {
      throw new Error(response.message || 'Une erreur est survenue lors de la restauration du document.')
    }
  } catch (error: any) {
    console.error('Error restoring document:', error)
    toast({
      title: 'Erreur',
      description: error.message || 'Impossible de restaurer le document.',
      variant: 'destructive',
    })
  }
}

const handleBulkRestore = async () => {
  try {
    const response = await documentsService.bulkRestore(selectedDocuments.value)
    if (response.success) {
      toast({
        title: 'Documents restaurés',
        description: `${selectedDocuments.value.length} document(s) ont été restauré(s) avec succès.`,
      })
      selectedDocuments.value = []
      isBulkMode.value = false
      await fetchTrashedDocuments()
    } else {
      throw new Error(response.message || 'Une erreur est survenue lors de la restauration des documents.')
    }
  } catch (error: any) {
    console.error('Error bulk restoring documents:', error)
    toast({
      title: 'Erreur',
      description: error.message || 'Impossible de restaurer les documents.',
      variant: 'destructive',
    })
  }
}

// Add new refs for delete confirmation
const showDeleteConfirmation = ref(false)
const documentToDelete = ref<string | null>(null)
const showBulkDeleteConfirmation = ref(false)

// Update the handlePermanentDelete function
const handlePermanentDelete = async (docId: string) => {
  documentToDelete.value = docId
  showDeleteConfirmation.value = true
}

// Add new function for confirmed permanent delete
const confirmPermanentDelete = async () => {
  if (!documentToDelete.value) return
  
  try {
    const response = await documentsService.permanentDelete(documentToDelete.value)
    if (response.success) {
      toast({
        title: 'Document supprimé définitivement',
        description: 'Le document a été supprimé définitivement.',
      })
      await fetchTrashedDocuments()
    } else {
      throw new Error(response.message || 'Une erreur est survenue lors de la suppression du document.')
    }
  } catch (error: any) {
    console.error('Error permanently deleting document:', error)
    toast({
      title: 'Erreur',
      description: error.message || 'Impossible de supprimer définitivement le document.',
      variant: 'destructive',
    })
  } finally {
    showDeleteConfirmation.value = false
    documentToDelete.value = null
  }
}

// Update the handleBulkPermanentDelete function
const handleBulkPermanentDelete = () => {
  showBulkDeleteConfirmation.value = true
}

// Add new function for confirmed bulk permanent delete
const confirmBulkPermanentDelete = async () => {
  try {
    // Convert the array to a plain array and ensure it's not empty
    const plainArray = [...selectedDocuments.value]
    if (plainArray.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un document.',
        variant: 'destructive',
      })
      return
    }
    
    // Log the array being sent
    console.log('Sending bulk permanent delete request with array:', plainArray)
    
    // Send the array directly
    const response = await documentsService.bulkPermanentDelete(plainArray)
    if (response.success) {
      toast({
        title: 'Documents supprimés définitivement',
        description: `${selectedDocuments.value.length} document(s) ont été supprimé(s) définitivement.`,
      })
      selectedDocuments.value = []
      isBulkMode.value = false
      await fetchTrashedDocuments()
    } else {
      throw new Error(response.message || 'Une erreur est survenue lors de la suppression des documents.')
    }
  } catch (error: any) {
    console.error('Error bulk permanently deleting documents:', error)
    toast({
      title: 'Erreur',
      description: error.message || 'Impossible de supprimer définitivement les documents.',
      variant: 'destructive',
    })
  } finally {
    showBulkDeleteConfirmation.value = false
  }
}

// Add new function for select all
const selectAllDocuments = () => {
  if (selectedDocuments.value.length === trashedDocuments.value.length) {
    selectedDocuments.value = []
  } else {
    selectedDocuments.value = trashedDocuments.value.map(doc => doc.id)
  }
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

        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else class="space-y-4">
          <!-- Add bulk actions toolbar -->
          <div v-if="isBulkMode" class="flex items-center justify-between p-4 bg-muted/50 border-b">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="selectedDocuments.length === trashedDocuments.length"
                @change="selectAllDocuments"
                class="w-4 h-4 rounded border-gray-300"
              />
              <span class="text-sm text-muted-foreground">
                {{ selectedDocuments.length }} document(s) sélectionné(s)
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="handleBulkRestore"
                :disabled="selectedDocuments.length === 0"
                class="hover:text-green-500"
              >
                <FileText class="w-4 h-4 mr-2" />
                Restaurer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                @click="handleBulkPermanentDelete"
                :disabled="selectedDocuments.length === 0"
              >
                <Trash2 class="w-4 h-4 mr-2" />
                Supprimer définitivement
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="toggleBulkMode"
              >
                <X class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <!-- Add bulk mode toggle button -->
          <Button
            v-if="!isBulkMode"
            variant="outline"
            size="sm"
            class="mb-4"
            @click="toggleBulkMode"
          >
            <Grid2x2 class="w-4 h-4 mr-2" />
            Sélection multiple
          </Button>

          <!-- List View -->
          <div class="space-y-2">
            <div v-for="doc in trashedDocuments" :key="doc.id" class="flex items-center justify-between p-4 bg-card border rounded-lg relative">
              <!-- Selection checkbox -->
              <div v-if="isBulkMode" class="absolute left-4">
                <input
                  type="checkbox"
                  :checked="isDocumentSelected(doc.id)"
                  @change="toggleDocumentSelection(doc.id)"
                  class="w-4 h-4 rounded border-gray-300"
                />
              </div>
              
              <!-- Document info -->
              <div class="flex items-center gap-4 flex-1" :class="{ 'pl-8': isBulkMode }">
                <Trash2 class="h-6 w-6 text-muted-foreground" />
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium truncate">{{ doc.name }}</h3>
                  <p class="text-sm text-muted-foreground">
                    Supprimé le {{ new Date(doc.createdAt).toLocaleDateString() }} · {{ formatFileSize(doc.size) }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="handleRestore(doc.id)"
                  class="hover:text-green-500"
                >
                  <FileText class="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="handlePermanentDelete(doc.id)"
                >
                  <Trash2 class="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

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

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteConfirmation" @update:open="showDeleteConfirmation = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer définitivement</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement ce document ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showDeleteConfirmation = false">
            Annuler
          </Button>
          <Button variant="destructive" @click="confirmPermanentDelete">
            Supprimer définitivement
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Bulk Delete Confirmation Dialog -->
    <Dialog :open="showBulkDeleteConfirmation" @update:open="showBulkDeleteConfirmation = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer définitivement</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement {{ selectedDocuments.length }} document(s) ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showBulkDeleteConfirmation = false">
            Annuler
          </Button>
          <Button variant="destructive" @click="confirmBulkPermanentDelete">
            Supprimer définitivement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </SidebarProvider>
</template> 