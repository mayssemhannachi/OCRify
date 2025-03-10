<script setup lang="ts">
import { ref, computed } from 'vue'

import {
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
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
import Progress from '@/components/ui/progress/Progress.vue'



const isProcessing = ref(false)
const files = ref<File[]>([])
const dragOver = ref(false)
const selectedLanguage = ref('fr')
const processingProgress = ref(0)
const currentFileIndex = ref(0)
const processedResults = ref<Array<{
  fileName: string
  text: string
  confidence: number
  language: string
  processingTime: number
}>>([])
const showPreview = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const extractedText = ref('')
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadingFiles = ref<Array<{
  name: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
}>>([])
const selectedDocument = ref<{ name: string; text: string } | null>(null)

// Add new refs for preview features
const imageRotation = ref(0)
const imageScale = ref(1)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const imagePos = ref({ x: 0, y: 0 })

// Add new ref for editor content
const editorContent = ref('')

// Add new refs for editor state
const activeTab = ref('upload')
const editorFormatting = ref({
  bold: false,
  italic: false,
  underline: false,
  align: 'left',
  list: false,
  orderedList: false,
})

const ocrSettings = ref({
  language: 'fr',
  quality: 'high',
  autoRotate: true,
  enhanceText: true,
  confidenceThreshold: 80
})

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' }
]

const qualityOptions = [
  { value: 'high', label: 'Haute qualité' },
  { value: 'balanced', label: 'Equilibré' },
  { value: 'fast', label: 'Rapide' }
]

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    isUploading.value = true
    uploadingFiles.value = Array.from(input.files).map(file => ({
      name: file.name,
      progress: 0,
      status: 'uploading' as const
    }))
    
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i]
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        uploadingFiles.value[i].progress = progress
      }
      uploadingFiles.value[i].status = 'complete'
      selectedFile.value = file
      selectedDocument.value = null
    }
    
    isUploading.value = false
    uploadingFiles.value = []
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files.length) {
    isUploading.value = true
    uploadingFiles.value = Array.from(event.dataTransfer.files).map(file => ({
      name: file.name,
      progress: 0,
      status: 'uploading' as const
    }))
    
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const file = event.dataTransfer.files[i]
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        uploadingFiles.value[i].progress = progress
      }
      uploadingFiles.value[i].status = 'complete'
      selectedFile.value = file
      selectedDocument.value = null
    }
    
    isUploading.value = false
    uploadingFiles.value = []
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = true
}

const handleDragLeave = () => {
  dragOver.value = false
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const handleFileSelect = (fileOrDoc: File | { fileName: string; text: string; confidence: number; language: string; processingTime: number }) => {
  if (fileOrDoc instanceof File) {
    selectedFile.value = fileOrDoc
    if (fileOrDoc.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(fileOrDoc)
    }
  } else {
    selectedDocument.value = { name: fileOrDoc.fileName, text: fileOrDoc.text }
  }
  showPreview.value = true
}

// Add methods for preview features
const rotateImage = (direction: 'clockwise' | 'counterclockwise') => {
  imageRotation.value += direction === 'clockwise' ? 90 : -90
}

const zoomImage = (type: 'in' | 'out') => {
  const factor = type === 'in' ? 1.2 : 0.8
  imageScale.value = Math.min(Math.max(0.5, imageScale.value * factor), 3)
}

const resetPreview = () => {
  imageRotation.value = 0
  imageScale.value = 1
  imagePos.value = { x: 0, y: 0 }
}

const startDrag = (event: MouseEvent) => {
  isDragging.value = true
  startPos.value = {
    x: event.clientX - imagePos.value.x,
    y: event.clientY - imagePos.value.y
  }
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  imagePos.value = {
    x: event.clientX - startPos.value.x,
    y: event.clientY - startPos.value.y
  }
}

const stopDrag = () => {
  isDragging.value = false
}

const downloadImage = () => {
  if (!previewUrl.value) return
  const link = document.createElement('a')
  link.href = previewUrl.value
  link.download = selectedFile.value?.name || 'preview.png'
  link.click()
}

// Update closePreview to include reset
const closePreview = () => {
  showPreview.value = false
  selectedFile.value = null
  previewUrl.value = ''
  resetPreview()
}

const startProcessing = async () => {
  if (files.value.length === 0) return
  
  isProcessing.value = true
  processingProgress.value = 0
  currentFileIndex.value = 0
  processedResults.value = []

  for (const file of files.value) {
    currentFileIndex.value++
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock OCR result
    processedResults.value.push({
      fileName: file.name,
      text: "Lorem ipsum dolor sit amet...",
      confidence: Math.random() * 20 + 80, // Random confidence between 80-100
      language: selectedLanguage.value,
      processingTime: Math.random() * 2 + 0.5 // Random processing time between 0.5-2.5s
    })
    
    processingProgress.value = (currentFileIndex.value / files.value.length) * 100
  }
  
  isProcessing.value = false
}



const startOCR = async () => {
  if (!selectedFile.value && !selectedDocument.value) return
  
  isProcessing.value = true
  
  // Simulate OCR processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock OCR result
  const mockText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  extractedText.value = mockText
  editorContent.value = mockText
  
  isProcessing.value = false
}

const handleDocumentSelect = (doc: { fileName: string; text: string }) => {
  selectedDocument.value = { name: doc.fileName, text: doc.text }
  selectedFile.value = null
  previewUrl.value = ''
  editorContent.value = doc.text
}

// Add type for editor formatting keys
type EditorFormatKey = keyof typeof editorFormatting.value

// Update toggleFormat function
const toggleFormat = (format: EditorFormatKey) => {
  if (format === 'align') {
    const aligns = ['left', 'center', 'right']
    const currentIndex = aligns.indexOf(editorFormatting.value.align)
    editorFormatting.value.align = aligns[(currentIndex + 1) % aligns.length]
  } else {
    editorFormatting.value[format] = !editorFormatting.value[format]
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
                <BreadcrumbPage>Scanner</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col gap-6 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Scanner OCR</h1>
            <p class="text-muted-foreground mt-1">Traitement OCR avancé de vos documents</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Content Area -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Document Selection Area -->
            <Card>
              <CardHeader>
                <CardTitle>Document à traiter</CardTitle>
                <CardDescription>Importez un nouveau document ou choisissez parmi les documents existants</CardDescription>
              </CardHeader>
              <CardContent>
                <!-- Custom Tabs -->
                <div class="flex border-b mb-4">
                  <button
                    v-for="tab in ['upload', 'existing']"
                    :key="tab"
                    class="px-4 py-2 text-sm font-medium transition-colors"
                    :class="{
                      'border-b-2 border-primary text-primary': activeTab === tab,
                      'text-muted-foreground hover:text-primary': activeTab !== tab
                    }"
                    @click="activeTab = tab"
                  >
                    {{ tab === 'upload' ? 'Nouveau document' : 'Documents existants' }}
                  </button>
                </div>

                <!-- Upload Tab Content -->
                <div v-show="activeTab === 'upload'">
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
                      <p class="text-xs text-muted-foreground mt-2">PDF, PNG, JPG jusqu'à 10MB</p>
                    </div>
                  </div>

                  <!-- Upload Progress -->
                  <div v-else class="space-y-4">
                    <div class="text-center text-sm text-muted-foreground mb-4">
                      Importation des fichiers en cours...
                    </div>
                    <div v-for="(file, index) in uploadingFiles" :key="index" class="space-y-2">
                      <div class="flex items-center justify-between text-sm">
                        <span class="truncate">{{ file.name }}</span>
                        <span>{{ file.progress }}%</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary transition-all duration-300"
                          :style="{ width: `${file.progress}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Existing Documents Tab Content -->
                <div v-show="activeTab === 'existing'" class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium">Documents récents</h3>
                    <div class="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText class="h-4 w-4 mr-2" />
                        Tous les documents
                      </Button>
                    </div>
                  </div>
                  
                  <div class="grid gap-4">
                    <div
                      v-for="doc in processedResults"
                      :key="doc.fileName"
                      class="group relative flex items-center justify-between p-4 rounded-lg border transition-all hover:border-primary/50 cursor-pointer"
                      :class="{ 
                        'border-primary bg-primary/5': selectedDocument?.name === doc.fileName,
                        'hover:bg-muted/50': selectedDocument?.name !== doc.fileName
                      }"
                      @click="handleDocumentSelect(doc)"
                    >
                      <div class="flex items-center gap-4">
                        <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText class="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p class="font-medium">{{ doc.fileName }}</p>
                          <p class="text-sm text-muted-foreground">
                            {{ doc.confidence }}% de précision · {{ doc.language }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" @click.stop="handleFileSelect(doc)">
                          <Eye class="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" @click.stop="startOCR">
                          <ImageIcon class="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Document Info -->
                <div v-if="selectedFile || selectedDocument" class="mt-4 p-4 bg-muted rounded-lg">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <FileText class="h-5 w-5 text-primary" />
                      <span class="font-medium">{{ selectedFile?.name || selectedDocument?.name }}</span>
                    </div>
                    <Button variant="ghost" size="sm" @click="selectedFile = null; selectedDocument = null">
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <!-- Processing Progress -->
                <div v-if="isProcessing" class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">Traitement en cours...</span>
                    <Loader2 class="h-4 w-4 animate-spin" />
                  </div>
                  <Progress :value="processingProgress" class="mb-2" />
                </div>
              </CardContent>
            </Card>

            <!-- Text Editor -->
            <Card>
              <CardHeader>
                <CardTitle>Texte extrait</CardTitle>
                <CardDescription>Le texte extrait du document apparaîtra ici</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="relative">
                  <!-- Editor Toolbar -->
                  <div class="flex items-center gap-1 p-2 border-b bg-muted/50 rounded-t-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.bold }"
                      @click="toggleFormat('bold')"
                    >
                      <Bold class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.italic }"
                      @click="toggleFormat('italic')"
                    >
                      <Italic class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.underline }"
                      @click="toggleFormat('underline')"
                    >
                      <Underline class="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" class="h-4 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.align === 'left' }"
                      @click="toggleFormat('align')"
                    >
                      <AlignLeft class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.align === 'center' }"
                      @click="toggleFormat('align')"
                    >
                      <AlignCenter class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.align === 'right' }"
                      @click="toggleFormat('align')"
                    >
                      <AlignRight class="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" class="h-4 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.list }"
                      @click="toggleFormat('list')"
                    >
                      <List class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="{ 'bg-muted': editorFormatting.orderedList }"
                      @click="toggleFormat('orderedList')"
                    >
                      <ListOrdered class="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" class="h-4 mx-1" />
                    <Button variant="ghost" size="sm">
                      <Undo class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Redo class="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <!-- Editor Content -->
                  <textarea
                    v-model="editorContent"
                    class="min-h-[400px] w-full p-4 rounded-b-lg border bg-background resize-none"
                    :class="{ 
                      'pointer-events-none opacity-50': !selectedFile && !selectedDocument,
                      'text-center': editorFormatting.align === 'center',
                      'text-right': editorFormatting.align === 'right',
                      'font-bold': editorFormatting.bold,
                      'italic': editorFormatting.italic,
                      'underline': editorFormatting.underline,
                      'list-decimal': editorFormatting.orderedList,
                      'list-disc': editorFormatting.list
                    }"
                    placeholder="Le texte extrait apparaîtra ici..."
                  ></textarea>
                  
                  <div v-if="isProcessing" class="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 class="h-8 w-8 animate-spin" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Language Selection -->
            <Card>
              <CardHeader>
                <CardTitle>Paramètres OCR</CardTitle>
                <CardDescription>Configuration du traitement OCR</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="text-sm font-medium mb-2 block">Langue du document</label>
                  <select v-model="selectedLanguage" class="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <Button 
                  class="w-full" 
                  @click="startOCR" 
                  :disabled="isProcessing || (!selectedFile && !selectedDocument)"
                >
                  <ImageIcon class="h-4 w-4 mr-2" />
                  {{ isProcessing ? 'Traitement en cours...' : 'Lancer l\'OCR' }}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template> 