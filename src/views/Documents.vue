<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Search,
  FileText,
  Filter,
  Calendar,
  FileType2,
  Download,
  Eye,
  Trash2,
  Grid2x2,
  List,
  SortAsc,
  Clock,
  Languages,
  Percent,
  ChevronDown,
  X,
  Plus,
  ChevronUp,
  Star,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
const searchQuery = ref('')
const showFilters = ref(false)
const showExpandedFilters = ref(false)
const selectedType = ref('all')
const selectedStatus = ref('all')
const selectedLanguage = ref('all')
const dateRange = ref({
  start: '',
  end: ''
})
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('date')

interface Document {
  id: number
  name: string
  type: string
  date: string
  size: string
  status: string
  preview: string
  extractedText: string
  lastModified: string
  createdBy: string
  tags: string[]
  language: string
  ocrConfidence: number
  thumbnail: string
  favorite: boolean
}

const documents = ref<Document[]>([
  {
    id: 1,
    name: 'Facture-Mars2024.pdf',
    type: 'pdf',
    date: '2024-03-10',
    size: '1.2 Mo',
    status: 'Traité',
    preview: '/previews/invoice.png',
    extractedText: '2800 caractères',
    lastModified: '2024-03-10 14:30',
    createdBy: 'John Doe',
    tags: ['facture', 'finance'],
    language: 'fr',
    ocrConfidence: 98,
    thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QzxAOEE4Ny42RUhMSk1RV11dXjs+Y2NqZWlLSkL/2wBDAR...',
    favorite: true
  },
  {
    id: 2,
    name: 'Contrat-Client.pdf',
    type: 'pdf',
    date: '2024-03-08',
    size: '2.5 Mo',
    status: 'Traité',
    preview: '/previews/contract.png',
    extractedText: '5200 caractères',
    lastModified: '2024-03-08 09:15',
    createdBy: 'Jane Smith',
    tags: ['contrat', 'client'],
    language: 'fr',
    ocrConfidence: 95,
    thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QzxAOEE4Ny42RUhMSk1RV11dXjs+Y2NqZWlLSkL/2wBDAR...',
    favorite: false
  },
  {
    id: 3,
    name: 'Scan-Document.jpg',
    type: 'image',
    date: '2024-03-07',
    size: '3.1 Mo',
    status: 'En attente',
    preview: '/previews/scan.png',
    extractedText: 'En attente',
    lastModified: '2024-03-07 16:45',
    createdBy: 'John Doe',
    tags: ['scan', 'document'],
    language: 'fr',
    ocrConfidence: 0,
    thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QzxAOEE4Ny42RUhMSk1RV11dXjs+Y2NqZWlLSkL/2wBDAR...',
    favorite: false
  },
  {
    id: 4,
    name: 'Rapport-Février.pdf',
    type: 'pdf',
    date: '2024-02-28',
    size: '1.8 Mo',
    status: 'Traité',
    preview: '/previews/report.png',
    extractedText: '3500 caractères',
    lastModified: '2024-02-28 11:20',
    createdBy: 'Alice Johnson',
    tags: ['rapport', 'mensuel'],
    language: 'fr',
    ocrConfidence: 97,
    thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QzxAOEE4Ny42RUhMSk1RV11dXjs+Y2NqZWlLSkL/2wBDAR...',
    favorite: false
  },
  {
    id: 5,
    name: 'Notes-Réunion.pdf',
    type: 'pdf',
    date: '2024-02-25',
    size: '0.8 Mo',
    status: 'Traité',
    preview: '/previews/notes.png',
    extractedText: '1500 caractères',
    lastModified: '2024-02-25 15:00',
    createdBy: 'Bob Wilson',
    tags: ['notes', 'réunion'],
    language: 'fr',
    ocrConfidence: 96,
    thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QzxAOEE4Ny42RUhMSk1RV11dXjs+Y2NqZWlLSkL/2wBDAR...',
    favorite: false
  }
])

const showUploadModal = ref(false)
const dragOver = ref(false)
const selectedFavorites = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadingFiles = ref<{ name: string; progress: number; status: 'uploading' | 'complete' | 'error' }[]>([])

const sortedAndFilteredDocuments = computed(() => {
  return documents.value
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesType = selectedType.value === 'all' || doc.type === selectedType.value
      const matchesStatus = selectedStatus.value === 'all' || doc.status === selectedStatus.value
      const matchesLanguage = selectedLanguage.value === 'all' || doc.language === selectedLanguage.value
      const matchesFavorites = !selectedFavorites.value || doc.favorite
      
      let matchesDate = true
      if (dateRange.value.start && dateRange.value.end) {
        const docDate = new Date(doc.date)
        const start = new Date(dateRange.value.start)
        const end = new Date(dateRange.value.end)
        matchesDate = docDate >= start && docDate <= end
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesLanguage && matchesDate && matchesFavorites
    })
    .sort((a, b) => {
      if (sortBy.value === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy.value === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy.value === 'size') {
        return parseFloat(b.size) - parseFloat(a.size)
      } else if (sortBy.value === 'confidence') {
        return b.ocrConfidence - a.ocrConfidence
      }
      return 0
    })
})

const showViewModal = ref(false)
const selectedDocument = ref<Document | null>(null)

const handleView = (docId: number) => {
  const doc = documents.value.find(d => d.id === docId)
  if (doc) {
    selectedDocument.value = doc
    showViewModal.value = true
  }
}

const handleDownload = (docId: number) => {
  // Implement document download logic
  console.log('Downloading document:', docId)
}

const handleDelete = (docId: number) => {
  // Move to trash instead of deleting
  documents.value = documents.value.filter(doc => doc.id !== docId)
}

// Add new computed property for active filters
const activeFilters = computed(() => {
  const filters = []
  if (selectedType.value !== 'all') {
    filters.push({ type: 'type', value: selectedType.value === 'pdf' ? 'PDF' : 'Image' })
  }
  if (dateRange.value.start && dateRange.value.end) {
    filters.push({ 
      type: 'date', 
      value: `${new Date(dateRange.value.start).toLocaleDateString()} - ${new Date(dateRange.value.end).toLocaleDateString()}`
    })
  }
  if (selectedLanguage.value !== 'all') {
    filters.push({ 
      type: 'language', 
      value: selectedLanguage.value === 'fr' ? 'Français' : selectedLanguage.value === 'en' ? 'Anglais' : 'Arabe'
    })
  }
  return filters
})

// Add function to remove filter
const removeFilter = (filterType: string) => {
  if (filterType === 'type') {
    selectedType.value = 'all'
  } else if (filterType === 'date') {
    dateRange.value = { start: '', end: '' }
  } else if (filterType === 'language') {
    selectedLanguage.value = 'all'
  }
}

// Add function to get OCR confidence color
const getOcrConfidenceColor = (score: number) => {
  if (score >= 95) return 'text-green-600 dark:text-green-400'
  if (score >= 85) return 'text-yellow-600 dark:text-yellow-400'
  if (score > 0) return 'text-red-600 dark:text-red-400'
  return 'text-muted-foreground'
}

// Add new function to handle favorites
const toggleFavorite = (docId: number) => {
  const doc = documents.value.find(d => d.id === docId)
  if (doc) {
    doc.favorite = !doc.favorite
  }
}

// Update the handleFileUpload function
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    isUploading.value = true
    uploadingFiles.value = Array.from(input.files).map(file => ({
      name: file.name,
      progress: 0,
      status: 'uploading'
    }))

    // Simulate file upload for each file
    for (let i = 0; i < uploadingFiles.value.length; i++) {
      const file = uploadingFiles.value[i]
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        file.progress = progress
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Mark as complete
      file.status = 'complete'
    }

    // Reset after all files are processed
    setTimeout(() => {
      isUploading.value = false
      uploadingFiles.value = []
      showUploadModal.value = false
    }, 1000)
  }
}

// Update the handleDrop function
const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files.length) {
    isUploading.value = true
    uploadingFiles.value = Array.from(event.dataTransfer.files).map(file => ({
      name: file.name,
      progress: 0,
      status: 'uploading'
    }))

    // Simulate file upload for each file
    for (let i = 0; i < uploadingFiles.value.length; i++) {
      const file = uploadingFiles.value[i]
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        file.progress = progress
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Mark as complete
      file.status = 'complete'
    }

    // Reset after all files are processed
    setTimeout(() => {
      isUploading.value = false
      uploadingFiles.value = []
      showUploadModal.value = false
    }, 1000)
  }
}

// Update the helper function for status icons
const getUploadStatusIcon = (status: string) => {
  switch (status) {
    case 'uploading': return Loader2
    case 'complete': return CheckCircle2
    case 'error': return XCircle
    default: return Loader2
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = true
}

const handleDragLeave = () => {
  dragOver.value = false
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
                <BreadcrumbPage>Documents</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col gap-4 p-6 relative">
        <!-- Search Bar and Actions -->
        <div class="flex flex-col gap-2 w-full">
          <div class="flex items-center gap-4 w-full">
            <div class="flex-1 flex items-center gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  v-model="searchQuery"
                  class="pl-8 pr-24"
                  placeholder="Rechercher des documents..."
                />
                <Button
                  variant="ghost"
                  size="sm"
                  class="absolute right-1 top-1"
                  @click="showFilters = !showFilters"
                >
                  <Filter class="h-4 w-4" />
                  <span class="ml-2 text-xs">Filtres</span>
                  <ChevronDown class="ml-1 h-3 w-3" :class="{ 'rotate-180': showFilters }" />
                </Button>
              </div>
              
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  :class="{ 'text-primary': viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                >
                  <Grid2x2 class="h-4 w-4 mr-1" />
                  <span class="text-xs">Grille</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  :class="{ 'text-primary': viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  <List class="h-4 w-4 mr-1" />
                  <span class="text-xs">Liste</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  @click="showUploadModal = true"
                >
                  <Plus class="h-4 w-4 mr-1" />
                  <span class="text-xs">Nouveau document</span>
                </Button>
              </div>
            </div>
          </div>

          <!-- Active Filter Badges -->
          <div v-if="activeFilters.length > 0 || selectedFavorites" class="flex flex-wrap gap-2">
            <div
              v-for="filter in activeFilters"
              :key="filter.type"
              class="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              <span>{{ filter.value }}</span>
              <Button
                variant="ghost"
                size="icon"
                class="h-4 w-4 hover:bg-primary/20"
                @click="removeFilter(filter.type)"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
            <div
              v-if="selectedFavorites"
              class="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs"
            >
              <Star class="h-3 w-3 fill-current" />
              <span>Favoris</span>
              <Button
                variant="ghost"
                size="icon"
                class="h-4 w-4 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                @click="selectedFavorites = false"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
          </div>

          <!-- Filters Panel -->
          <div v-if="showFilters" class="w-full">
            <div class="space-y-4 p-4 bg-muted rounded-lg animate-in slide-in-from-top">
              <!-- Basic Filters -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center gap-2">
                  <FileType2 class="h-4 w-4 text-muted-foreground" />
                  <select
                    v-model="selectedType"
                    class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="all">Tous les types</option>
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-muted-foreground" />
                  <div class="flex gap-2 items-center w-full">
                    <input
                      type="date"
                      v-model="dateRange.start"
                      class="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                    <span class="text-muted-foreground">à</span>
                    <input
                      type="date"
                      v-model="dateRange.end"
                      class="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Star class="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="outline"
                    class="w-full justify-start"
                    :class="{ 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800': selectedFavorites }"
                    @click="selectedFavorites = !selectedFavorites"
                  >
                    <Star class="h-4 w-4 mr-2" :class="{ 'fill-yellow-400 text-yellow-400': selectedFavorites }" />
                    {{ selectedFavorites ? 'Tous les documents' : 'Favoris uniquement' }}
                  </Button>
                </div>
              </div>

              <!-- Expand Filters Button -->
              <div class="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="showExpandedFilters = !showExpandedFilters"
                >
                  <Plus v-if="!showExpandedFilters" class="h-4 w-4 mr-1" />
                  <ChevronUp v-else class="h-4 w-4 mr-1" />
                  {{ showExpandedFilters ? 'Moins de filtres' : 'Plus de filtres' }}
                </Button>
              </div>

              <!-- Additional Filters -->
              <div v-if="showExpandedFilters" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div class="flex items-center gap-2">
                  <Languages class="h-4 w-4 text-muted-foreground" />
                  <select
                    v-model="selectedLanguage"
                    class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="all">Toutes les langues</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="ar">Arabe</option>
                  </select>
                </div>

                <div class="flex items-center gap-2">
                  <SortAsc class="h-4 w-4 text-muted-foreground" />
                  <select
                    v-model="sortBy"
                    class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="date">Date</option>
                    <option value="name">Nom</option>
                    <option value="size">Taille</option>
                    <option value="confidence">Score OCR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Card v-for="doc in sortedAndFilteredDocuments" :key="doc.id" class="overflow-hidden">
            <CardContent class="p-0">
              <div class="aspect-[3/4] relative group">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" @click.stop>
                  <Button variant="secondary" size="sm" @click="handleView(doc.id)">
                    <Eye class="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="secondary" size="sm" @click="handleDownload(doc.id)">
                    <Download class="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  <Button variant="secondary" size="sm" @click="handleDelete(doc.id)">
                    <Trash2 class="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
                <!-- Document Preview -->
                <div class="absolute inset-0 bg-muted cursor-pointer" @click="handleView(doc.id)">
                  <img 
                    :src="doc.thumbnail" 
                    :alt="doc.name"
                    class="w-full h-full object-cover"
                    @error="(e: Event) => { const target = e.target as HTMLImageElement; if (target) target.style.display = 'none' }"
                  />
                  <div v-if="!doc.thumbnail" class="absolute inset-0 flex items-center justify-center">
                    <FileText class="h-20 w-20 text-muted-foreground" />
                  </div>
                </div>
                <!-- Status Badge -->
                <div class="absolute top-2 right-2">
                  <span :class="{
                    'px-2 py-1 rounded-full text-xs font-medium': true,
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': doc.status === 'Traité',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': doc.status === 'En attente'
                  }">
                    {{ doc.status }}
                  </span>
                </div>
                <!-- Language Badge -->
                <div class="absolute top-2 left-2">
                  <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {{ (doc.language || '').toUpperCase() }}
                  </span>
                </div>
                <!-- Add download and favorite icons -->
                <div class="absolute bottom-2 right-2 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <Button
                    variant="secondary"
                    size="icon"
                    class="h-8 w-8 bg-black/60 hover:bg-black/80"
                    @click.stop="handleDownload(doc.id)"
                  >
                    <Download class="h-4 w-4 text-white" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    class="h-8 w-8 bg-black/60 hover:bg-black/80"
                    @click.stop="toggleFavorite(doc.id)"
                  >
                    <Star
                      class="h-4 w-4"
                      :class="doc.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-white'"
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter class="p-3 flex-col items-start">
              <div class="flex items-center justify-between w-full">
                <h3 class="font-medium text-sm truncate flex-1">{{ doc.name }}</h3>
                <Button variant="ghost" size="icon" class="h-8 w-8" @click="handleDelete(doc.id)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
              <div class="w-full mt-2 space-y-1">
                <p class="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar class="h-3 w-3" />
                  {{ doc.date }}
                </p>
                <p class="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText class="h-3 w-3" />
                  {{ doc.extractedText }}
                </p>
                <p class="text-xs flex items-center gap-1">
                  <Percent class="h-3 w-3" />
                  <span :class="getOcrConfidenceColor(doc.ocrConfidence)">
                    Score OCR: {{ doc.ocrConfidence }}%
                  </span>
                </p>
                <p class="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock class="h-3 w-3" />
                  Modifié le {{ doc.lastModified }}
                </p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <span v-for="tag in doc.tags" :key="tag"
                    class="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <!-- List View -->
        <div v-else class="space-y-2">
          <div v-for="doc in sortedAndFilteredDocuments" :key="doc.id" 
            class="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
            <div class="flex items-center gap-4">
              <!-- Document Thumbnail -->
              <div class="w-16 h-16 relative rounded overflow-hidden bg-background">
                <img 
                  :src="doc.thumbnail" 
                  :alt="doc.name"
                  class="w-full h-full object-cover"
                  @error="(e: Event) => { const target = e.target as HTMLImageElement; if (target) target.style.display = 'none' }"
                />
                <div v-if="!doc.thumbnail" class="absolute inset-0 flex items-center justify-center">
                  <FileText class="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium">{{ doc.name }}</h3>
                  <span :class="{
                    'px-2 py-0.5 rounded-full text-xs font-medium': true,
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': doc.status === 'Traité',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': doc.status === 'En attente'
                  }">
                    {{ doc.status }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {{ (doc.language || '').toUpperCase() }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ doc.date }} · {{ doc.size }} · {{ doc.extractedText }}
                </p>
                <p class="text-sm flex items-center gap-1">
                  <Percent class="h-4 w-4" />
                  <span :class="getOcrConfidenceColor(doc.ocrConfidence)">
                    Score OCR: {{ doc.ocrConfidence }}%
                  </span>
                </p>
                <p class="text-sm text-muted-foreground">
                  Modifié par {{ doc.createdBy }} le {{ doc.lastModified }}
                </p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="tag in doc.tags" :key="tag"
                    class="px-2 py-0.5 bg-background rounded-full text-xs text-muted-foreground">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" @click="toggleFavorite(doc.id)">
                <Star
                  class="h-4 w-4 mr-1"
                  :class="doc.favorite ? 'fill-yellow-400 text-yellow-400' : ''"
                />
                Favoris
              </Button>
              <Button variant="ghost" size="sm" @click="handleView(doc.id)">
                <Eye class="h-4 w-4 mr-1" />
                Voir
              </Button>
              <Button variant="ghost" size="sm" @click="handleDownload(doc.id)">
                <Download class="h-4 w-4 mr-1" />
                Télécharger
              </Button>
              <Button variant="ghost" size="sm" @click="handleDelete(doc.id)">
                <Trash2 class="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="sortedAndFilteredDocuments.length === 0" class="text-center py-12">
          <FileText class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium">Aucun document trouvé</h3>
          <p class="text-muted-foreground">Essayez de modifier vos filtres ou d'ajouter de nouveaux documents.</p>
        </div>

        <!-- Add document view modal -->
        <div v-if="showViewModal && selectedDocument" 
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          @click="showViewModal = false"
        >
          <div 
            class="bg-background rounded-lg shadow-lg w-full h-[90vh] mx-4 overflow-hidden flex animate-in zoom-in-95 duration-200" 
            @click.stop
          >
            <!-- Document Preview Panel (Left) -->
            <div class="w-3/5 h-full flex flex-col">
              <div class="flex items-center justify-between p-4 border-b">
                <h2 class="text-xl font-semibold flex items-center gap-2">
                  {{ selectedDocument.name }}
                  <span :class="{
                    'px-2 py-1 rounded-full text-xs font-medium': true,
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': selectedDocument.status === 'Traité',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': selectedDocument.status === 'En attente'
                  }">
                    {{ selectedDocument.status }}
                  </span>
                </h2>
                <Button variant="ghost" size="icon" @click="showViewModal = false">
                  <X class="h-4 w-4" />
                </Button>
              </div>
              <div class="flex-1 overflow-auto p-4 bg-muted/30">
                <div class="bg-muted rounded-lg overflow-hidden h-full flex items-center justify-center">
                  <img 
                    :src="selectedDocument.thumbnail" 
                    :alt="selectedDocument.name"
                    class="max-w-full max-h-full object-contain"
                    @error="(e: Event) => { const target = e.target as HTMLImageElement; if (target) target.style.display = 'none' }"
                  />
                </div>
              </div>
            </div>

            <!-- Information Panel (Right) -->
            <div class="w-2/5 border-l h-full flex flex-col">
              <div class="p-4 border-b flex items-center justify-between">
                <h3 class="font-medium">Informations du document</h3>
                <Button variant="outline" size="sm" @click="handleDownload(selectedDocument.id)">
                  <Download class="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              
              <div class="flex-1 overflow-auto">
                <div class="p-4 space-y-6">
                  <!-- Basic Info -->
                  <div class="space-y-2">
                    <h4 class="text-sm font-medium text-muted-foreground">Détails</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div class="flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-muted-foreground" />
                        <span>{{ selectedDocument.date }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <FileText class="h-4 w-4 text-muted-foreground" />
                        <span>{{ selectedDocument.size }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Clock class="h-4 w-4 text-muted-foreground" />
                        <span>{{ selectedDocument.lastModified }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Languages class="h-4 w-4 text-muted-foreground" />
                        <span>{{ selectedDocument.language.toUpperCase() }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- OCR Information -->
                  <div class="space-y-2">
                    <h4 class="text-sm font-medium text-muted-foreground">Analyse OCR</h4>
                    <div class="bg-muted rounded-lg p-4 space-y-4">
                      <!-- OCR Score -->
                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-sm">Score de confiance</span>
                          <span :class="[
                            'text-sm font-medium',
                            getOcrConfidenceColor(selectedDocument.ocrConfidence)
                          ]">
                            {{ selectedDocument.ocrConfidence }}%
                          </span>
                        </div>
                        <div class="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div
                            class="h-full rounded-full transition-all"
                            :class="{
                              'bg-green-500': selectedDocument.ocrConfidence >= 95,
                              'bg-yellow-500': selectedDocument.ocrConfidence >= 85 && selectedDocument.ocrConfidence < 95,
                              'bg-red-500': selectedDocument.ocrConfidence > 0 && selectedDocument.ocrConfidence < 85
                            }"
                            :style="{ width: `${selectedDocument.ocrConfidence}%` }"
                          ></div>
                        </div>
                      </div>
                      
                      <!-- Extracted Text Stats -->
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span class="text-muted-foreground">Caractères</span>
                          <p class="font-medium">{{ selectedDocument.extractedText }}</p>
                        </div>
                        <div>
                          <span class="text-muted-foreground">Langue détectée</span>
                          <p class="font-medium">{{ selectedDocument.language === 'fr' ? 'Français' : selectedDocument.language === 'en' ? 'Anglais' : 'Arabe' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Tags -->
                  <div class="space-y-2">
                    <h4 class="text-sm font-medium text-muted-foreground">Tags</h4>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="tag in selectedDocument.tags" :key="tag"
                        class="px-2 py-1 bg-muted rounded-full text-sm">
                        {{ tag }}
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="space-y-2">
                    <h4 class="text-sm font-medium text-muted-foreground">Actions</h4>
                    <div class="flex flex-col gap-2">
                      <Button class="justify-start" variant="outline" @click="toggleFavorite(selectedDocument.id)">
                        <Star
                          class="h-4 w-4 mr-2"
                          :class="selectedDocument.favorite ? 'fill-yellow-400 text-yellow-400' : ''"
                        />
                        {{ selectedDocument.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
                      </Button>
                      <Button class="justify-start" variant="outline">
                        <Eye class="h-4 w-4 mr-2" />
                        Voir le texte extrait
                      </Button>
                      <Button class="justify-start text-destructive" variant="outline" @click="handleDelete(selectedDocument.id)">
                        <Trash2 class="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Upload Modal -->
  <div
    v-if="showUploadModal"
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
    @click="showUploadModal = false"
  >
    <div
      class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
      @click.stop
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Ajouter un nouveau document</h2>
        <Button variant="ghost" size="sm" @click="showUploadModal = false">
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Upload Area -->
      <div
        v-if="!isUploading"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        class="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 transition-colors"
        :class="{
          'border-primary/50 bg-primary/5': dragOver,
          'hover:border-primary/50': !dragOver
        }"
      >
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          class="hidden"
          id="file-upload"
          multiple
          @change="handleFileUpload"
        />
        
        <div class="text-center">
          <Upload class="w-12 h-12 mb-4 mx-auto text-muted-foreground" />
          <label
            for="file-upload"
            class="cursor-pointer text-center"
          >
            <span class="font-medium text-primary hover:underline">Cliquez pour importer</span>
            <span class="text-muted-foreground"> ou glissez-déposez</span>
          </label>
          <p class="text-xs text-muted-foreground mt-2">PDF, PNG, JPG jusqu'à 10MB par fichier</p>
        </div>
      </div>

      <!-- Upload Progress -->
      <div v-else class="space-y-4">
        <div
          v-for="file in uploadingFiles"
          :key="file.name"
          class="bg-muted rounded-lg p-4 space-y-2"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <component
                :is="getUploadStatusIcon(file.status)"
                class="h-4 w-4"
                :class="{
                  'animate-spin': file.status === 'uploading',
                  'text-blue-500': file.status === 'uploading',
                  'text-green-500': file.status === 'complete',
                  'text-red-500': file.status === 'error'
                }"
              />
              <span class="text-sm font-medium">{{ file.name }}</span>
            </div>
            <span class="text-xs text-muted-foreground">
              {{ file.status === 'uploading' ? `${file.progress}%` : 
                 file.status === 'complete' ? 'Terminé' : 'Erreur' }}
            </span>
          </div>
          
          <div class="h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="{
                'bg-blue-500': file.status === 'uploading',
                'bg-green-500': file.status === 'complete',
                'bg-red-500': file.status === 'error'
              }"
              :style="{ width: `${file.progress}%` }"
            ></div>
          </div>
        </div>

        <p class="text-sm text-center text-muted-foreground">
          {{ uploadingFiles.every(f => f.status === 'complete') 
            ? 'Tous les fichiers ont été importés avec succès'
            : 'Importation des fichiers en cours...' }}
        </p>
      </div>

      <!-- Modal Actions -->
      <div class="flex justify-end gap-2">
        <Button 
          variant="outline" 
          @click="showUploadModal = false"
          :disabled="isUploading"
        >
          {{ isUploading ? 'Veuillez patienter...' : 'Annuler' }}
        </Button>
        <Button
          v-if="!isUploading"
          :disabled="uploadingFiles.length === 0"
        >
          Importer
        </Button>
      </div>
    </div>
  </div>
</template> 