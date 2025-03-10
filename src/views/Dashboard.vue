<script lang="ts">
export const iframeHeight = '800px'
export const description = 'A left and right sidebar.'
</script>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Upload,
  FileText,
  Search,
  Loader2,
  FolderOpen,
  Image,
  FileType2,
  AlertCircle,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Eye,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Languages,
  Filter,
  Download,
  Share2,
  FolderInput,
  Settings,
  X,
  Calendar,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Progress from '@/components/ui/progress/Progress.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SidebarLeft from '@/components/SidebarLeft.vue'
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

const route = useRoute()
const isProcessing = ref(false)
const uploadedFile = ref<File | null>(null)
const processedText = ref('')
const dragOver = ref(false)

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

// Mock data for dashboard statistics
const stats = ref({
  documentsProcessed: 156,
  averageAccuracy: 97.2,
  totalStorage: '2.3 GB',
  processingTime: '1.8s',
  totalCharacters: '1.2M',
  languagesDetected: ['Français', 'English', 'العربية'],
  successRate: 98.5,
  documentsToday: 12
})

// Add types at the top of the script section
interface Document {
  id: number
  name: string
  action: string
  status: string
  accuracy?: number
  timestamp: string
  type: string
  details: string
  actionDescription: string
  actionResult: string
  thumbnail?: string
}

// Add preview state with proper typing
const showPreview = ref(false)
const selectedDocument = ref<Document | null>(null)

// Update recentActivity with more action-focused details
const recentActivity = ref<Document[]>([
  {
    id: 1,
    name: 'Facture-EDF-Mars2024.pdf',
    action: 'scan',
    status: 'success',
    accuracy: 98,
    timestamp: '2024-03-10 14:30',
    type: 'pdf',
    details: 'Document scanné avec succès',
    actionDescription: 'Scan OCR effectué',
    actionResult: '98% de précision · 2800 caractères extraits'
  },
  {
    id: 2,
    name: 'Contrat-Location.jpg',
    action: 'edit',
    status: 'success',
    timestamp: '2024-03-10 11:15',
    type: 'image',
    details: 'Modification des métadonnées',
    actionDescription: 'Métadonnées mises à jour',
    actionResult: 'Tags et informations modifiés'
  },
  {
    id: 3,
    name: 'Reçu-Amazon.pdf',
    action: 'scan',
    status: 'processing',
    timestamp: '2024-03-10 10:45',
    type: 'pdf',
    details: 'Traitement OCR en cours',
    actionDescription: 'Scan OCR en cours',
    actionResult: 'Traitement automatique'
  },
  {
    id: 4,
    name: 'Document-Scan.jpg',
    action: 'delete',
    status: 'failed',
    timestamp: '2024-03-09 16:20',
    type: 'image',
    details: 'Échec de la suppression',
    actionDescription: 'Tentative de suppression',
    actionResult: 'Erreur: Fichier en cours d\'utilisation'
  }
])

// Watch for route changes to reset state when needed
watch(() => route.path, (newPath) => {
  if (newPath === '/dashboard') {
    uploadedFile.value = null
    processedText.value = ''
  }
})

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    uploadedFile.value = input.files[0]
    processFile()
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files.length) {
    uploadedFile.value = event.dataTransfer.files[0]
    processFile()
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = true
}

const handleDragLeave = () => {
  dragOver.value = false
}

const processFile = async () => {
  if (!uploadedFile.value) return
  
  isProcessing.value = true
  // TODO: Implement actual OCR processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  processedText.value = "Sample processed text..."
  isProcessing.value = false
  
  // Add to recent activity
  recentActivity.value.unshift({
    id: Date.now(),
    name: uploadedFile.value.name,
    action: 'scan',
    status: 'success',
    accuracy: 96,
    timestamp: new Date().toLocaleString(),
    type: uploadedFile.value.type.includes('pdf') ? 'pdf' : 'image',
    details: 'Scan réussi avec 96% de précision',
    actionDescription: 'Scan OCR effectué',
    actionResult: '96% de précision · 2800 caractères extraits'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'text-green-500'
    case 'processing': return 'text-blue-500'
    case 'failed': return 'text-red-500'
    default: return 'text-muted-foreground'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success': return CheckCircle2
    case 'processing': return Loader2
    case 'failed': return XCircle
    default: return AlertCircle
  }
}

// Get the current page title based on route
const pageTitle = computed(() => {
  switch (route.path) {
    case '/dashboard':
      return 'Accueil'
    case '/corbeille':
      return 'Corbeille'
    default:
      return 'Accueil'
  }
})

const handleDocumentClick = () => {
  showRestoreAlert.value = true
  setTimeout(() => {
    showRestoreAlert.value = false
  }, 3000)
}

const handleRestore = (docId: number) => {
  trashedDocuments.value = trashedDocuments.value.filter(doc => doc.id !== docId)
  // Here you would typically make an API call to restore the document
}

const handleDelete = (docId: number) => {
  trashedDocuments.value = trashedDocuments.value.filter(doc => doc.id !== docId)
  // Here you would typically make an API call to permanently delete the document
}

// Add chart data
const weeklyStats = ref({
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  documents: [12, 15, 8, 23, 17, 10, 5],
  accuracy: [95, 97, 94, 98, 96, 93, 97]
})

const monthlyStats = ref({
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
  documents: [85, 102, 123, 115, 138, 156],
  storage: [1.2, 1.5, 1.8, 2.0, 2.1, 2.3]
})

// Document categories for quick filtering
const documentCategories = [
  { name: 'Tous', count: 156 },
  { name: 'Factures', count: 45 },
  { name: 'Contrats', count: 32 },
  { name: 'Rapports', count: 28 },
  { name: 'Autres', count: 51 }
]

const handlePreview = (document: Document) => {
  selectedDocument.value = document
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  selectedDocument.value = null
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'scan': return Image
    case 'edit': return FileText
    case 'delete': return Trash2
    default: return FileText
  }
}

const getActionColor = (action: string, status: string) => {
  if (status === 'failed') return 'text-red-500'
  switch (action) {
    case 'scan': return 'text-blue-500'
    case 'edit': return 'text-green-500'
    case 'delete': return 'text-orange-500'
    default: return 'text-muted-foreground'
  }
}

const getOcrConfidenceColor = (accuracy: number | undefined) => {
  if (accuracy === undefined) return 'text-muted-foreground'
  if (accuracy >= 95) return 'text-green-500'
  if (accuracy >= 85 && accuracy < 95) return 'text-yellow-500'
  return 'text-red-500'
}

const handleDownload = (docId: number) => {
  // Implement the download logic here
}

// Add showViewModal ref
const showViewModal = ref(false)
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
                <BreadcrumbPage>Accueil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col p-6">
        <!-- Welcome Section -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-semibold">Tableau de bord</h1>
            <p class="text-muted-foreground mt-1">Aperçu de vos activités OCR et documents</p>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Documents traités</CardTitle>
              <FileText class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.documentsProcessed }}</div>
              <p class="text-xs text-muted-foreground">+{{ stats.documentsToday }} aujourd'hui</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Précision moyenne</CardTitle>
              <BarChart3 class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.averageAccuracy }}%</div>
              <Progress 
                :value="stats.averageAccuracy" 
                :class="[
                  'mt-2',
                  stats.averageAccuracy >= 95 ? 'bg-green-500' : 
                  stats.averageAccuracy >= 85 ? 'bg-yellow-500' : 
                  'bg-red-500'
                ]"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Taux de réussite</CardTitle>
              <CheckCircle2 class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.successRate }}%</div>
              <Progress :value="stats.successRate" class="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Stockage utilisé</CardTitle>
              <FileType2 class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.totalStorage }}</div>
              <Progress :value="70" class="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Caractères extraits</CardTitle>
              <FileType2 class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.totalCharacters }}</div>
              <p class="text-xs text-muted-foreground">Total des caractères extraits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Temps de traitement</CardTitle>
              <Clock class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.processingTime }}</div>
              <p class="text-xs text-muted-foreground">Moyenne par page</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Langues détectées</CardTitle>
              <Languages class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-1">
                <span v-for="lang in stats.languagesDetected" :key="lang" class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                  {{ lang }}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Charts Section -->
        <div class="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BarChart3 class="h-5 w-5" />
                Activité hebdomadaire
              </CardTitle>
              <CardDescription>Documents traités et précision moyenne</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="h-[300px]">
                <!-- Add your chart component here -->
                <div class="flex items-end justify-between h-full">
                  <div v-for="(doc, index) in weeklyStats.documents" :key="index" class="flex flex-col items-center gap-2 w-[10%]">
                    <div class="text-xs text-muted-foreground">{{ weeklyStats.accuracy[index] }}%</div>
                    <div class="w-full bg-primary/20 rounded-t" :style="{ height: doc * 3 + 'px' }"></div>
                    <div class="text-xs">{{ weeklyStats.labels[index] }}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BarChart3 class="h-5 w-5" />
                Tendance mensuelle
              </CardTitle>
              <CardDescription>Evolution du nombre de documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="h-[300px]">
                <!-- Add your chart component here -->
                <div class="flex items-end justify-between h-full">
                  <div v-for="(doc, index) in monthlyStats.documents" :key="index" class="flex flex-col items-center gap-2 w-[15%]">
                    <div class="text-xs text-muted-foreground">{{ doc }}</div>
                    <div class="w-full bg-primary/20 rounded-t" :style="{ height: (doc / 2) + 'px' }"></div>
                    <div class="text-xs">{{ monthlyStats.labels[index] }}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Quick Actions and Recent Activity -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Quick Actions -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Settings class="h-5 w-5" />
                Actions rapides
              </CardTitle>
              <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid gap-2">
                <Button variant="outline" class="w-full justify-start" @click="$router.push('/scanner')">
                  <Image class="h-4 w-4 mr-2" />
                  Scanner un document
                </Button>
                <Button variant="outline" class="w-full justify-start" @click="$router.push('/documents')">
                  <FolderOpen class="h-4 w-4 mr-2" />
                  Parcourir les documents
                </Button>
                <Button variant="outline" class="w-full justify-start" @click="$router.push('/corbeille')">
                  <Trash2 class="h-4 w-4 mr-2" />
                  Accéder à la corbeille
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Recent Documents -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <FileText class="h-5 w-5" />
                Documents récents
              </CardTitle>
              <CardDescription>Derniers documents traités</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="doc in recentActivity.slice(0, 4)" :key="doc.id" 
                  class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText class="h-5 w-5 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ doc.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ doc.timestamp }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <Button variant="ghost" size="sm" @click.stop="handlePreview(doc)">
                      <Eye class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" class="w-full justify-center text-sm" @click="$router.push('/documents')">
                  Voir tous les documents
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Activity History -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Clock class="h-5 w-5" />
                Historique
              </CardTitle>
              <CardDescription>Historique des actions effectuées</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  class="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div class="h-8 w-8 rounded-full bg-background flex items-center justify-center shrink-0">
                    <component
                      :is="getActionIcon(activity.action)"
                      class="h-4 w-4"
                      :class="getActionColor(activity.action, activity.status)"
                    />
                  </div>
                  <div class="flex-1 min-w-0 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm">{{ activity.actionDescription }}</span>
                      <span v-if="activity.accuracy" class="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                        {{ activity.accuracy }}%
                      </span>
                    </div>
                    <p class="text-sm text-muted-foreground">{{ activity.actionResult }}</p>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{{ activity.timestamp }}</span>
                      <span>·</span>
                      <span class="truncate">{{ activity.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Preview Modal -->
  <div
    v-if="showPreview"
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
    @click="closePreview"
  >
    <div
      class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
      @click.stop
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ selectedDocument?.name }}</h2>
        <Button variant="ghost" size="sm" @click="closePreview">
          <X class="h-4 w-4" />
        </Button>
      </div>

      <div class="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <div class="w-full h-full flex items-center justify-center">
          <FileText class="h-16 w-16 text-muted-foreground" />
        </div>
      </div>

      <!-- Document Info -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="font-medium">Type</p>
          <p class="text-muted-foreground">{{ selectedDocument?.type }}</p>
        </div>
        <div>
          <p class="font-medium">Date de traitement</p>
          <p class="text-muted-foreground">{{ selectedDocument?.timestamp }}</p>
        </div>
        <div v-if="selectedDocument?.accuracy">
          <p class="font-medium">Précision</p>
          <p class="text-muted-foreground">{{ selectedDocument.accuracy }}%</p>
        </div>
        <div>
          <p class="font-medium">Statut</p>
          <p class="text-muted-foreground capitalize">{{ selectedDocument?.status }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Document Preview Modal (reusing from Documents.vue) -->
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
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': selectedDocument.status === 'success',
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': selectedDocument.status === 'processing',
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': selectedDocument.status === 'failed'
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
            <div v-if="!selectedDocument.thumbnail" class="flex items-center justify-center">
              <FileText class="h-16 w-16 text-muted-foreground" />
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
            <!-- Basic Info -->
            <div class="space-y-2">
              <h4 class="text-sm font-medium text-muted-foreground">Détails</h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-muted-foreground" />
                  <span>{{ selectedDocument.timestamp }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <FileText class="h-4 w-4 text-muted-foreground" />
                  <span>{{ selectedDocument.type }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  <span>{{ selectedDocument.timestamp }}</span>
                </div>
              </div>
            </div>

            <!-- OCR Information -->
            <div v-if="selectedDocument.accuracy" class="space-y-2">
              <h4 class="text-sm font-medium text-muted-foreground">Analyse OCR</h4>
              <div class="bg-muted rounded-lg p-4 space-y-4">
                <!-- OCR Score -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm">Score de confiance</span>
                    <span :class="[
                      'text-sm font-medium',
                      getOcrConfidenceColor(selectedDocument.accuracy)
                    ]">
                      {{ selectedDocument.accuracy }}%
                    </span>
                  </div>
                  <div class="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="{
                        'bg-green-500': selectedDocument.accuracy >= 95,
                        'bg-yellow-500': selectedDocument.accuracy >= 85 && selectedDocument.accuracy < 95,
                        'bg-red-500': selectedDocument.accuracy < 85
                      }"
                      :style="{ width: `${selectedDocument.accuracy}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <h4 class="text-sm font-medium text-muted-foreground">Actions</h4>
              <div class="flex flex-col gap-2">
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
</template>