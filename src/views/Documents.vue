<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
import FileUpload from '@/components/ui/file-upload/FileUpload.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { documents as documentsService } from '@/services/api'
import type { DocumentDto, BackendDocumentDto, DocumentSearchDto } from '@/types/documents'
import { useToast } from '@/components/ui/toast/use-toast'

const route = useRoute()
const { toast } = useToast()
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

// Use the DocumentDto type from the API
type Document = DocumentDto & {
  documentUrl: string
}

const documents = ref<Document[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(19) // Changed from 3 to 19 to show all documents
const totalDocuments = ref(0)
const selectedFavorites = ref(false)

// Add new helper function for date formatting
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Update the formatFileSize function to be more precise
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// Add helper function to construct file URLs
const getFileUrl = (path: string, docId: string): string => {
  if (!path || !docId) return ''
  // Use the authenticated endpoint with the document ID
  return `${import.meta.env.VITE_API_URL}/api/Documents/${docId}/download`
}

// Update the fetchDocuments function
const fetchDocuments = async () => {
  try {
    console.log('Starting document fetch...');
    console.log('Current status:', selectedStatus.value);
    console.log('Type of selectedStatus:', typeof selectedStatus.value);
    isLoading.value = true;
    
    // Always include these parameters
    const searchParams: DocumentSearchDto = {
      page: currentPage.value,
      pageSize: pageSize.value,
      includeDeleted: selectedStatus.value === 'Deleted', // Explicitly set based on status
      // Only set status if it's not 'all' and not 'Deleted'
      ...(selectedStatus.value !== 'all' && selectedStatus.value !== 'Deleted' && {
        status: selectedStatus.value === 'Complete' ? 4 : selectedStatus.value === 'Uploaded' ? 0 : undefined
      })
    };

    // Add optional filters only if they are set
    if (searchQuery.value.trim()) {
      searchParams.searchTerm = searchQuery.value.trim();
    }
    if (selectedType.value !== 'all') {
      searchParams.type = selectedType.value;
    }
    if (selectedLanguage.value !== 'all') {
      searchParams.language = selectedLanguage.value;
    }
    if (dateRange.value.start && dateRange.value.end) {
      searchParams.dateFrom = new Date(dateRange.value.start);
      searchParams.dateTo = new Date(dateRange.value.end);
    }
    if (selectedFavorites.value) {
      searchParams.favoritesOnly = true;
    }

    // Log the exact parameters being sent
    console.log('Making API request with params:', {
      ...searchParams,
      dateFrom: searchParams.dateFrom instanceof Date ? searchParams.dateFrom.toISOString() : searchParams.dateFrom,
      dateTo: searchParams.dateTo instanceof Date ? searchParams.dateTo.toISOString() : searchParams.dateTo,
      includeDeleted: searchParams.includeDeleted
    });

    const response = await documentsService.getAll(searchParams);
    console.log('API response received:', response);

    if (response.success && response.data) {
      console.log('Processing response data:', {
        totalCount: response.data.totalCount,
        itemsCount: response.data.items.length
      });
      
      documents.value = response.data.items.map((doc: BackendDocumentDto) => ({
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
        documentUrl: getFileUrl(doc.filePath, doc.id),
        isDeleted: doc.isDeleted
      }));
      totalDocuments.value = response.data.totalCount;
      console.log('Documents processed and updated:', {
        documentsCount: documents.value.length,
        totalCount: totalDocuments.value
      });
    } else {
      console.error('Invalid response format:', response);
      documents.value = [];
      totalDocuments.value = 0;
    }
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    documents.value = [];
    totalDocuments.value = 0;
  } finally {
    isLoading.value = false;
    console.log('Document fetch completed');
  }
};

// Call fetchDocuments when component mounts
onMounted(() => {
  console.log('Component mounted, initial status:', selectedStatus.value);
  console.log('Type of initial status:', typeof selectedStatus.value);
  fetchDocuments();
})

// Add watcher for selectedStatus
watch(selectedStatus, (newStatus) => {
  console.log('Status changed to:', newStatus);
  console.log('Type of newStatus:', typeof newStatus);
  console.log('Value of newStatus:', newStatus);
  fetchDocuments();
}, { immediate: true });

const showUploadModal = ref(false)
const dragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadingFiles = ref<{ name: string; progress: number; status: 'uploading' | 'complete' | 'error' }[]>([])

const sortedAndFilteredDocuments = computed(() => {
  console.log('Filtering documents with status:', selectedStatus.value);
  const filtered = documents.value
    .filter(doc => {
      const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesType = selectedType.value === 'all' || doc.type === selectedType.value
      const matchesLanguage = selectedLanguage.value === 'all' || doc.language === selectedLanguage.value
      const matchesFavorites = !selectedFavorites.value || doc.isFavorite
      
      let matchesDate = true
      if (dateRange.value.start && dateRange.value.end) {
        const docDate = new Date(doc.createdAt)
        const start = new Date(dateRange.value.start)
        const end = new Date(dateRange.value.end)
        matchesDate = docDate >= start && docDate <= end
      }
      
      // Check if document is deleted using IsDeleted property
      const isDeleted = doc.isDeleted
      console.log('Document filtering:', {
        docId: doc.id,
        docName: doc.name,
        isDeleted,
        selectedStatus: selectedStatus.value,
        matchesSearch,
        matchesType,
        matchesLanguage,
        matchesDate,
        matchesFavorites
      });
      
      // Show deleted documents only when status filter is 'Deleted'
      if (selectedStatus.value === 'Deleted') {
        return matchesSearch && matchesType && matchesLanguage && matchesDate && matchesFavorites && isDeleted
      }
      
      // Show non-deleted documents when status filter is not 'Deleted'
      if (selectedStatus.value === 'all') {
        return matchesSearch && matchesType && matchesLanguage && matchesDate && matchesFavorites && !isDeleted
      }
      
      // For other status filters, show only matching non-deleted documents
      return matchesSearch && matchesType && matchesLanguage && matchesDate && matchesFavorites && !isDeleted && doc.status === selectedStatus.value
    })
    .sort((a, b) => {
      if (sortBy.value === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy.value === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy.value === 'size') {
        return b.size - a.size
      } else if (sortBy.value === 'confidence') {
        return (b.accuracy || 0) - (a.accuracy || 0)
      }
      return 0
    })
  
  console.log('Filtered documents count:', filtered.length);
  return filtered;
})

const showViewModal = ref(false)
const selectedDocument = ref<Document | null>(null)
const imageLoading = ref(true)
const errorToastShown = ref(false)

// Update image error handler
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '' // Clear the source to show the fallback
  imageLoading.value = false
  
  // Only show error toast once
  if (!errorToastShown.value) {
    errorToastShown.value = true
    toast({
      title: 'Erreur de chargement',
      description: 'Impossible de charger l\'image. Veuillez vérifier votre authentification.',
      variant: 'destructive'
    })
  }
}

// Update the handleView function
const handleView = async (docId: string) => {
  try {
    const response = await documentsService.getById(docId)
    if (response.data?.success && response.data.data) {
      const doc = response.data.data
      
      // Get the file content using the authenticated endpoint
      try {
        // For images, fetch the blob and create a URL
        if (doc.fileType?.toLowerCase().includes('image')) {
          const fileResponse = await documentsService.getFile(docId)
          const blob = new Blob([fileResponse.data], { type: doc.fileType })
          const imageUrl = URL.createObjectURL(blob)
          
      selectedDocument.value = {
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
            documentUrl: imageUrl,
            isDeleted: doc.isDeleted
      }
      showViewModal.value = true
          errorToastShown.value = false // Reset error toast flag
          return
        }

        // For other file types, fetch the content
        const fileResponse = await documentsService.getFile(docId)
        if (fileResponse.data) {
          const blob = new Blob([fileResponse.data], { type: doc.fileType })
          selectedDocument.value = {
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
            documentUrl: URL.createObjectURL(blob),
            isDeleted: doc.isDeleted
          }
          showViewModal.value = true
          }
        } catch (error) {
        console.error('Error fetching file content:', error)
        // Show error toast and still open the panel with placeholder
        selectedDocument.value = {
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
          documentUrl: '', // Empty URL for placeholder
          isDeleted: doc.isDeleted
        }
        showViewModal.value = true
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger le contenu du document.',
          variant: 'destructive'
        })
      }
    }
  } catch (error) {
    console.error('Error fetching document details:', error)
    toast({
      title: 'Erreur',
      description: 'Impossible de charger les détails du document.',
      variant: 'destructive'
    })
  }
}

// Update the closeViewModal function to revoke the blob URL
const closeViewModal = () => {
  if (selectedDocument.value?.documentUrl && selectedDocument.value.documentUrl.startsWith('blob:')) {
    URL.revokeObjectURL(selectedDocument.value.documentUrl)
  }
  showViewModal.value = false
  selectedDocument.value = null
  errorToastShown.value = false
}

// Update the handleDownload function
const handleDownload = async (docId: string) => {
  try {
    const response = await documentsService.getById(docId)
    if (response.data?.success && response.data.data) {
      const doc = response.data.data
      
      // Get the file using the API service
      const fileResponse = await documentsService.getFile(docId)
      if (fileResponse.data) {
        // Create a blob from the response data
        const blob = new Blob([fileResponse.data], { type: doc.fileType })
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob)
        // Create a temporary link element
        const link = document.createElement('a')
        link.href = url
        link.download = doc.fileName
        // Append to body, click, and remove
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        // Clean up the URL
        window.URL.revokeObjectURL(url)
      }
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    toast({
      title: 'Erreur',
      description: 'Impossible de télécharger le document.',
      variant: 'destructive'
    })
  }
}

// Add new ref for delete confirmation
const showDeleteConfirmation = ref(false)
const documentToDelete = ref<string | null>(null)
const showBulkDeleteConfirmation = ref(false)

// Update the handleDelete function
const handleDelete = async (docId: string) => {
  try {
    await documentsService.delete(docId)
    toast({
      title: 'Document supprimé',
      description: 'Le document a été déplacé dans la corbeille.',
    })
    // Refresh the documents list to update the status
    await fetchDocuments()
  } catch (error) {
    console.error('Error deleting document:', error)
    toast({
      title: 'Erreur',
      description: 'Impossible de supprimer le document.',
      variant: 'destructive',
    })
  }
}

// Update the handleRestore function
const handleRestore = async (docId: string) => {
  try {
    const response = await documentsService.restore(docId)
    if (response.success) {
      toast({
        title: 'Document restauré',
        description: 'Le document a été restauré avec succès.',
      })
    await fetchDocuments()
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

// Update the handlePermanentDelete function
const handlePermanentDelete = async (docId: string) => {
  documentToDelete.value = docId
  showDeleteConfirmation.value = true
}

// Add new function for confirmed permanent delete
const confirmPermanentDelete = async () => {
  if (!documentToDelete.value) return
  
  try {
    await documentsService.permanentDelete(documentToDelete.value)
    toast({
      title: 'Document supprimé définitivement',
      description: 'Le document a été supprimé définitivement.',
    })
    await fetchDocuments()
  } catch (error) {
    console.error('Error permanently deleting document:', error)
    toast({
      title: 'Erreur',
      description: 'Impossible de supprimer définitivement le document.',
      variant: 'destructive',
    })
  } finally {
    showDeleteConfirmation.value = false
    documentToDelete.value = null
  }
}

// Add bulk operations
const selectedDocuments = ref<string[]>([])
const isBulkMode = ref(false)

const handleBulkDelete = async () => {
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
    console.log('Sending bulk delete request with array:', plainArray)
    
    // Send the array directly without wrapping it in an object
    await documentsService.bulkDelete(plainArray)
    
    toast({
      title: 'Documents supprimés',
      description: 'Les documents ont été déplacés dans la corbeille.',
    })
    selectedDocuments.value = []
    isBulkMode.value = false
    await fetchDocuments()
  } catch (error) {
    console.error('Error bulk deleting documents:', error)
    toast({
      title: 'Erreur',
      description: 'Impossible de supprimer les documents.',
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
      await fetchDocuments()
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
    console.log('Sending bulk delete request with array:', plainArray)
    
    // First soft-delete the documents
    const deleteResponse = await documentsService.bulkDelete(plainArray)
    if (!deleteResponse.success) {
      throw new Error(deleteResponse.message || 'Une erreur est survenue lors de la suppression des documents.')
    }

    // Then permanently delete them
    const permanentDeleteResponse = await documentsService.bulkPermanentDelete(plainArray)
    if (permanentDeleteResponse.success) {
      toast({
        title: 'Documents supprimés définitivement',
        description: `${selectedDocuments.value.length} document(s) ont été supprimé(s) définitivement.`,
      })
      selectedDocuments.value = []
      isBulkMode.value = false
      await fetchDocuments()
    } else {
      throw new Error(permanentDeleteResponse.message || 'Une erreur est survenue lors de la suppression définitive des documents.')
    }
  } catch (error) {
    console.error('Error bulk permanently deleting documents:', error)
    toast({
      title: 'Erreur',
      description: 'Impossible de supprimer définitivement les documents.',
      variant: 'destructive',
    })
  } finally {
    showBulkDeleteConfirmation.value = false
  }
}

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

// Add computed property for bulk actions visibility
const showBulkActions = computed(() => selectedDocuments.value.length > 0)

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
      value: selectedLanguage.value === 'fr' ? 'Français' : selectedLanguage.value === 'en' || selectedLanguage.value === 'english' ? 'Anglais' : 'Arabe'
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

// Update the toggleFavorite function
const toggleFavorite = async (docId: string) => {
  try {
    // Update the document in the list
    const doc = documents.value.find(d => d.id === docId)
    if (!doc) return

    // Toggle the favorite status locally first for immediate feedback
    doc.isFavorite = !doc.isFavorite

    // If the document is being viewed in the preview panel, update it there too
    if (selectedDocument.value && selectedDocument.value.id === docId) {
      selectedDocument.value.isFavorite = doc.isFavorite
    }

    // Make the API call to update the favorite status
    await documentsService.updateFavorite(docId, doc.isFavorite)

    // Refresh the documents list to ensure consistency
    await fetchDocuments()
  } catch (error) {
    console.error('Error toggling favorite status:', error)
    // Revert the local changes if the API call fails
    const doc = documents.value.find(d => d.id === docId)
    if (doc) {
      doc.isFavorite = !doc.isFavorite
    }
    if (selectedDocument.value && selectedDocument.value.id === docId) {
      selectedDocument.value.isFavorite = !selectedDocument.value.isFavorite
    }
  }
}

// Add new refs for metadata form
const showMetadataForm = ref(false)
const selectedFile = ref<File | null>(null)
const documentMetadata = ref({
  language: 'French',
  topic: '',
  description: '',
  tags: '',
  isFavorite: false
})

// Add new function to handle file selection
const handleFileSelect = (files: File[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0]
    showMetadataForm.value = true
  }
}

// Add new function to handle metadata form submission
const handleMetadataSubmit = async () => {
  if (!selectedFile.value) return
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    // Convert tags string to array
    const metadata = {
      ...documentMetadata.value,
      tags: documentMetadata.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }
    
    formData.append('metadata', JSON.stringify(metadata))
    
    const response = await documentsService.upload(selectedFile.value, metadata)
    if (response.data.success) {
      toast({
        title: 'Document uploadé',
        description: 'Le document a été uploadé avec succès.',
      })
      showMetadataForm.value = false
      selectedFile.value = null
      documentMetadata.value = {
        language: 'French',
        topic: '',
        description: '',
        tags: '',
        isFavorite: false
      }
      await fetchDocuments()
    } else {
      throw new Error(response.data.message || 'Une erreur est survenue lors de l\'upload.')
    }
  } catch (error: any) {
    console.error('Error uploading document:', error)
    toast({
      title: 'Erreur',
      description: error.message || 'Impossible d\'uploader le document.',
      variant: 'destructive',
    })
  }
}

// Update the handleUploadSuccess function
const handleUploadSuccess = async (files: File[]) => {
  // Close the upload modal
  showUploadModal.value = false
  
  // Show success toast
  toast({
    title: 'Documents uploadés',
    description: `${files.length} document(s) ont été uploadé(s) avec succès.`,
  })
  
  // Refresh the documents list
  await fetchDocuments()
}

// Update the handleUploadError function
const handleUploadError = (error: any) => {
  console.error('Upload error:', error)
  // Error is handled by the FileUpload component
}

// Add function to handle pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchDocuments()
}

// Add function to handle page size change
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchDocuments()
}

// Add new function for select all
const selectAllDocuments = () => {
  if (selectedDocuments.value.length === sortedAndFilteredDocuments.value.length) {
    selectedDocuments.value = []
  } else {
    selectedDocuments.value = sortedAndFilteredDocuments.value.map(doc => doc.id)
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
                <Button @click="showUploadModal = true">
                  <Upload class="h-4 w-4 mr-2" />
                  Nouveau document
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

              <!-- Status Filter -->
              <div class="flex items-center gap-2">
                <Filter class="h-4 w-4 text-muted-foreground" />
                <select
                  v-model="selectedStatus"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  @change="() => {
                    console.log('Status dropdown changed to:', selectedStatus);
                    console.log('Type of selectedStatus:', typeof selectedStatus);
                  }"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Complete">Traité</option>
                  <option value="Uploaded">En attente</option>
                  <option value="Deleted">Corbeille</option>
                </select>
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

        <!-- Bulk Actions Toolbar -->
        <div v-if="isBulkMode" class="flex items-center justify-between p-4 bg-muted/50 border-b">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="selectedDocuments.length === sortedAndFilteredDocuments.length"
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
              @click="handleBulkDelete"
              :disabled="selectedDocuments.length === 0"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Déplacer dans la corbeille
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

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Card v-for="doc in sortedAndFilteredDocuments" :key="doc.id" class="overflow-hidden relative">
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
                  <!-- PDF Preview -->
                  <div v-if="doc.type?.toLowerCase().includes('pdf')" class="w-full h-full flex flex-col items-center justify-center p-4">
                    <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-2">
                      <FileText class="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <span class="text-xs text-muted-foreground">PDF Document</span>
                  </div>
                  
                  <!-- Image Preview -->
                  <div v-else-if="doc.type?.toLowerCase().includes('image')" class="w-full h-full flex flex-col items-center justify-center p-4">
                    <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
                      <ImageIcon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span class="text-xs text-muted-foreground">Image</span>
                  </div>
                  
                  <!-- Default Preview -->
                  <div v-else class="w-full h-full flex flex-col items-center justify-center p-4">
                    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                      <FileText class="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span class="text-xs text-muted-foreground">{{ doc.type || 'Document' }}</span>
                  </div>
                </div>
                <!-- Status Badge -->
                <div class="absolute top-2 right-2">
                  <span :class="{
                    'px-2 py-1 rounded-full text-xs font-medium': true,
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': doc.status === 'Complete',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': doc.status === 'Uploaded'
                  }">
                    {{ doc.status === 'Complete' ? 'Traité' : 'En attente' }}
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
                      class="h-4 w-4 transition-colors duration-200"
                      :class="[
                        doc.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-white',
                        'hover:text-yellow-400 hover:fill-yellow-400'
                      ]"
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter class="p-3 flex-col items-start relative">
              <!-- Selection checkbox -->
              <div v-if="isBulkMode" class="absolute bottom-3 right-3">
                <input
                  type="checkbox"
                  :checked="isDocumentSelected(doc.id)"
                  @change="toggleDocumentSelection(doc.id)"
                  class="w-4 h-4 rounded border-gray-300"
                />
              </div>
              <div class="flex items-center justify-between w-full">
                <h3 class="font-medium text-sm truncate flex-1">{{ doc.name }}</h3>
                <div class="flex items-center gap-2">
                  <Button
                    v-if="doc.status === 'Deleted' || doc.isDeleted"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 hover:text-red-500"
                    @click="handleRestore(doc.id)"
                  >
                    <FileText class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="doc.status === 'Deleted' || doc.isDeleted"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 hover:text-red-500"
                    @click="handlePermanentDelete(doc.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                  <Button
                    v-else
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 hover:text-red-500"
                    @click="handleDelete(doc.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div class="w-full mt-2 space-y-1">
                <p class="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar class="h-3 w-3" />
                  {{ formatDate(doc.createdAt) }}
                </p>
                <p class="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText class="h-3 w-3" />
                  {{ formatFileSize(doc.size) }}
                </p>
                <p class="text-xs flex items-center gap-1">
                  <Percent class="h-3 w-3" />
                  <span :class="getOcrConfidenceColor(doc.accuracy || 0)">
                    Score OCR: {{ doc.accuracy || 0 }}%
                  </span>
                </p>
                <p class="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock class="h-3 w-3" />
                  Modifié le {{ formatDate(doc.updatedAt) }}
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
            class="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors relative">
            <!-- Selection checkbox -->
            <div v-if="isBulkMode" class="absolute left-4">
              <input
                type="checkbox"
                :checked="isDocumentSelected(doc.id)"
                @change="toggleDocumentSelection(doc.id)"
                class="w-4 h-4 rounded border-gray-300"
              />
            </div>
            <div class="flex items-center gap-4 flex-1" :class="{ 'pl-8': isBulkMode }">
              <!-- Document Thumbnail -->
              <div class="w-16 h-16 relative rounded overflow-hidden bg-background">
                <!-- PDF Preview -->
                <div v-if="doc.type?.toLowerCase().includes('pdf')" class="w-full h-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                  <FileText class="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                
                <!-- Image Preview -->
                <div v-else-if="doc.type?.toLowerCase().includes('image')" class="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                  <ImageIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                
                <!-- Default Preview -->
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <FileText class="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium">{{ doc.name }}</h3>
                  <span :class="{
                    'px-2 py-0.5 rounded-full text-xs font-medium': true,
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': doc.status === 'Complete',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': doc.status === 'Uploaded'
                  }">
                    {{ doc.status === 'Complete' ? 'Traité' : 'En attente' }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {{ (doc.language || '').toUpperCase() }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(doc.createdAt) }} · {{ formatFileSize(doc.size) }} · {{ doc.description || 'No description' }}
                </p>
                <p class="text-sm flex items-center gap-1">
                  <Percent class="h-4 w-4" />
                  <span :class="getOcrConfidenceColor(doc.accuracy || 0)">
                    Score OCR: {{ doc.accuracy || 0 }}%
                  </span>
                </p>
                <p class="text-sm text-muted-foreground">
                  Modifié le {{ formatDate(doc.updatedAt) }}
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
              <Button 
                variant="ghost" 
                size="sm" 
                @click="toggleFavorite(doc.id)"
                :class="{ 'text-yellow-500': doc.isFavorite }"
                class="hover:text-yellow-500"
              >
                <Star
                  class="h-4 w-4 mr-1"
                  :class="doc.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''"
                />
                {{ doc.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
              </Button>
              <Button variant="ghost" size="sm" @click="handleView(doc.id)">
                <Eye class="h-4 w-4 mr-1" />
                Voir
              </Button>
              <Button variant="ghost" size="sm" @click="handleDownload(doc.id)">
                <Download class="h-4 w-4 mr-1" />
                Télécharger
              </Button>
              <Button
                v-if="doc.status === 'Deleted' || doc.isDeleted"
                variant="ghost"
                size="sm"
                @click="handleRestore(doc.id)"
              >
                <FileText class="h-4 w-4 mr-1" />
                Restaurer
              </Button>
              <Button
                v-if="doc.status === 'Deleted' || doc.isDeleted"
                variant="ghost"
                size="sm"
                @click="handlePermanentDelete(doc.id)"
              >
                <Trash2 class="h-4 w-4 mr-1" />
                Supprimer définitivement
              </Button>
              <Button
                v-else
                variant="ghost"
                size="sm"
                class="hover:text-red-500"
                @click="handleDelete(doc.id)"
              >
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
          @click="closeViewModal"
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
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': selectedDocument.status === 'Complete',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': selectedDocument.status === 'Uploaded'
                  }">
                    {{ selectedDocument.status === 'Complete' ? 'Traité' : 'En attente' }}
                  </span>
                </h2>
                <Button variant="ghost" size="icon" @click="closeViewModal">
                  <X class="h-4 w-4" />
                </Button>
              </div>
              <div class="flex-1 overflow-auto p-4 bg-muted/30">
                <div class="bg-muted rounded-lg overflow-hidden h-full flex items-center justify-center">
                  <!-- PDF Preview -->
                  <div v-if="selectedDocument.type?.toLowerCase().includes('pdf')" class="w-full h-full">
                    <iframe
                      :src="selectedDocument.documentUrl"
                      class="w-full h-full"
                      frameborder="0"
                    ></iframe>
                  </div>
                  
                  <!-- Image Preview -->
                  <div v-else-if="selectedDocument.type?.toLowerCase().includes('image')" class="w-full h-full">
                    <div class="relative w-full h-full">
                      <img
                        :src="selectedDocument.documentUrl"
                        :alt="selectedDocument.name"
                        class="w-full h-full object-contain"
                        @error="handleImageError"
                        @load="imageLoading = false"
                        crossorigin="use-credentials"
                        referrerpolicy="no-referrer"
                      />
                      <div v-if="imageLoading" class="absolute inset-0 flex items-center justify-center bg-muted/50">
                        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                    </div>
                  </div>
                  
                  <!-- Default Preview -->
                  <div v-else class="w-full h-full flex flex-col items-center justify-center p-8">
                    <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                      <FileText class="h-12 w-12 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span class="text-sm text-muted-foreground">{{ selectedDocument.type || 'Document' }}</span>
                  </div>
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
                  <!-- Document Details -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-4">
                      <!-- File Info -->
                      <div class="flex items-center gap-3 text-sm">
                        <FileText class="h-4 w-4 text-muted-foreground" />
                        <p class="font-medium">{{ formatFileSize(selectedDocument.size) }}</p>
                      </div>
                      <div class="flex items-center gap-3 text-sm">
                        <Languages class="h-4 w-4 text-muted-foreground" />
                        <p class="font-medium">{{ selectedDocument.language === 'fr' ? 'Français' : selectedDocument.language === 'en' || selectedDocument.language === 'english' ? 'Anglais' : 'Arabe' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- OCR Information -->
                  <div class="bg-muted rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-4">
                      <Percent class="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p class="font-medium">{{ selectedDocument.accuracy || 0 }}%</p>
                        <p class="text-xs text-muted-foreground">Score OCR</p>
                      </div>
                        </div>
                        <div class="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div
                            class="h-full rounded-full transition-all"
                            :class="{
                              'bg-green-500': (selectedDocument.accuracy || 0) >= 95,
                              'bg-yellow-500': (selectedDocument.accuracy || 0) >= 85 && (selectedDocument.accuracy || 0) < 95,
                              'bg-red-500': (selectedDocument.accuracy || 0) > 0 && (selectedDocument.accuracy || 0) < 85
                            }"
                            :style="{ width: `${selectedDocument.accuracy || 0}%` }"
                          ></div>
                    </div>
                  </div>

                  <!-- Tags -->
                  <div v-if="selectedDocument.tags && selectedDocument.tags.length > 0" class="space-y-2">
                    <div class="flex items-center gap-2">
                      <FileType2 class="h-4 w-4 text-muted-foreground" />
                      <span class="text-sm font-medium">Tags</span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="tag in selectedDocument.tags" :key="tag"
                        class="px-2 py-1 bg-muted rounded-full text-sm">
                        {{ tag }}
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <Eye class="h-4 w-4 text-muted-foreground" />
                      <span class="text-sm font-medium">Actions</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <Button 
                        class="justify-start" 
                        variant="outline" 
                        @click="toggleFavorite(selectedDocument.id)"
                        :class="{ 'text-yellow-500': selectedDocument.isFavorite }"
                      >
                        <Star
                          class="h-4 w-4 mr-2"
                          :class="selectedDocument.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''"
                        />
                        {{ selectedDocument.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
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

        <!-- Bulk Mode Toggle Button -->
        <Button
          v-if="!isBulkMode"
          variant="outline"
          size="sm"
          class="fixed bottom-4 right-4"
          @click="toggleBulkMode"
        >
          <Grid2x2 class="w-4 h-4 mr-2" />
          Sélection multiple
        </Button>
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Upload Modal -->
  <Dialog :open="showUploadModal" @update:open="showUploadModal = false">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Nouveau document</DialogTitle>
        <DialogDescription>
          Téléchargez un ou plusieurs documents pour les traiter avec OCR.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <FileUpload
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
          @file-select="handleFileSelect"
          :max-files="1"
          :accepted-file-types="['image/*', 'application/pdf']"
          :max-file-size="10 * 1024 * 1024"
        />
        </div>
    </DialogContent>
  </Dialog>

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

  <!-- Metadata Form Modal -->
  <Dialog :open="showMetadataForm" @update:open="showMetadataForm = false">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Informations du document</DialogTitle>
        <DialogDescription>
          Remplissez les informations concernant le document avant l'upload.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="language">Langue</Label>
          <Select v-model="documentMetadata.language">
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="French">Français</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Arabic">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label for="topic">Thème</Label>
          <Input id="topic" v-model="documentMetadata.topic" placeholder="Entrez le thème du document" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="documentMetadata.description" placeholder="Entrez une description du document" />
        </div>
        <div class="grid gap-2">
          <Label for="tags">Tags</Label>
          <Input id="tags" v-model="documentMetadata.tags" placeholder="Entrez les tags séparés par des virgules" />
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="favorite" v-model="documentMetadata.isFavorite" />
          <Label for="favorite">Marquer comme favori</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showMetadataForm = false">Annuler</Button>
        <Button @click="handleMetadataSubmit">Uploader</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template> 