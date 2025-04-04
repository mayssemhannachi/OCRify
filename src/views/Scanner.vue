<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

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
  Copy,
  FileDown,
  FileText as FileTextIcon,
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
import FileUpload from '@/components/ui/file-upload/FileUpload.vue'
import { ocr, documents } from '@/services/api'

interface Scan {
  id: number
  name: string
  status: 'success' | 'processing' | 'error'
  timestamp: string
  accuracy: number
  text: string
  type: string
}

interface Document {
  id: string
  fileName: string
  ocrText?: string
  enhancedText?: string
  status: number
  uploadDate: string
  language: string
  fileType: string
}

interface SelectedDocument {
  id: string
  name: string
  text: string
}

interface FileDocument {
  id: string
  fileName: string
  text: string
  confidence: number
  language: string
  processingTime: number
}

const isProcessing = ref(false)
const files = ref<File[]>([])
const dragOver = ref(false)
const selectedLanguage = ref('fra')
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
const selectedDocument = ref<SelectedDocument | null>(null)

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

const recentScans = ref<Scan[]>([])
const ocrMode = ref('accurate')
const autoRotate = ref(true)
const enhanceQuality = ref(true)

const handleFileUpload = (files: File[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0]
    if (files[0].type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(files[0])
    }
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files) {
    handleFileUpload(Array.from(event.dataTransfer.files))
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const handleFileSelect = (fileOrDoc: File | FileDocument) => {
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
    selectedDocument.value = { 
      id: fileOrDoc.id,
      name: fileOrDoc.fileName, 
      text: fileOrDoc.text 
    }
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

const handleUploadSuccess = async (files: File[]) => {
  try {
    const file = files[0]
    selectedFile.value = file
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
    
    isProcessing.value = true
    processingProgress.value = 0
    
    const progressInterval = setInterval(() => {
      if (processingProgress.value < 90) {
        processingProgress.value += Math.random() * 10
      }
    }, 200)
    
    try {
      const response = await ocr.process(file)
      clearInterval(progressInterval)
      processingProgress.value = 100
      
      if (response.data.success) {
        editorContent.value = response.data.data.text || exampleText
        extractedText.value = response.data.data.text || exampleText
        
        processedResults.value.unshift({
          fileName: file.name,
          text: response.data.data.text || exampleText,
          confidence: response.data.data.accuracy || 95,
          language: selectedLanguage.value,
          processingTime: response.data.data.processingTime || 1.5
        })
        
        await fetchRecentDocuments()
      }
    } catch (error) {
      console.error('OCR processing error:', error)
      // Use example text if there's an error
      editorContent.value = exampleText
      extractedText.value = exampleText
    }
  } catch (error) {
    console.error('Error processing file:', error)
    // Use example text if there's an error
    editorContent.value = exampleText
    extractedText.value = exampleText
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const handleUploadError = (error: any) => {
  console.error('Upload error:', error)
  // Error is handled by the FileUpload component
}

const startOCR = async () => {
  if (!selectedFile.value && !selectedDocument.value) return
  
  try {
    isProcessing.value = true
    processingProgress.value = 0
    
    const progressInterval = setInterval(() => {
      if (processingProgress.value < 90) {
        processingProgress.value += Math.random() * 10
      }
    }, 200)
    
    if (selectedFile.value) {
      const response = await ocr.process(selectedFile.value)
      clearInterval(progressInterval)
      processingProgress.value = 100
      
      if (response.data.success) {
        editorContent.value = response.data.data.text || ''
        extractedText.value = response.data.data.text || ''
        
        processedResults.value.unshift({
          fileName: selectedFile.value.name,
          text: response.data.data.text || '',
          confidence: response.data.data.accuracy || 95,
          language: selectedLanguage.value,
          processingTime: response.data.data.processingTime || 1.5
        })
        
        await fetchRecentDocuments()
      }
    } else if (selectedDocument.value) {
      const documentId = parseInt(selectedDocument.value.id)
      if (isNaN(documentId)) {
        throw new Error('Invalid document ID')
      }
      const response = await documents.scan(documentId)
      if (response.data.success) {
        clearInterval(progressInterval)
        processingProgress.value = 100
        
        if (response.data.data?.text) {
          editorContent.value = response.data.data.text
          extractedText.value = response.data.data.text
        }
      }
    }
  } catch (error) {
    console.error('OCR processing error:', error)
  } finally {
    setTimeout(() => {
      isProcessing.value = false
      processingProgress.value = 0
    }, 500)
  }
}

// Add new ref for recent documents
const recentDocuments = ref<Array<{
  id: string
  name: string
  status: string
  createdAt: string
  language: string
  type: string
}>>([])

// Add function to fetch recent documents
const fetchRecentDocuments = async () => {
  try {
    const response = await documents.getRecent()
    if (response.data.success) {
      recentDocuments.value = response.data.data.recentDocuments.map((doc: any) => ({
        id: doc.id,
        name: doc.fileName,
        status: doc.status,
        createdAt: doc.uploadDate,
        language: doc.language,
        type: doc.fileType
      }))
    }
  } catch (error) {
    console.error('Error fetching recent documents:', error)
  }
}

// Call fetchRecentDocuments when component mounts
onMounted(() => {
  fetchRecentDocuments()
})

// Update handleDocumentSelect to include example text
const handleDocumentSelect = async (doc: { id: string; name: string }) => {
  try {
    const response = await documents.getById(doc.id)
    if (response.data.success) {
      const document = response.data.data as Document
      selectedDocument.value = {
        id: document.id,
        name: document.fileName,
        text: document.ocrText || document.enhancedText || exampleText
      }
      selectedFile.value = null
      previewUrl.value = ''
      editorContent.value = document.ocrText || document.enhancedText || exampleText
    }
  } catch (error) {
    console.error('Error fetching document details:', error)
    // Use example text if there's an error
    selectedDocument.value = {
      id: 'example',
      name: 'Exemple de document',
      text: exampleText
    }
    editorContent.value = exampleText
  }
}

// Update the preview handler to include id
const handlePreview = (fileOrDoc: { id: string; fileName: string; text: string }) => {
  if (fileOrDoc instanceof File) {
    selectedFile.value = fileOrDoc
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(fileOrDoc)
  } else {
    selectedDocument.value = { 
      id: fileOrDoc.id,
      name: fileOrDoc.fileName, 
      text: fileOrDoc.text 
    }
  }
  showPreview.value = true
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

// Update copyText function to use plain text
const copyText = async () => {
  try {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = editorContent.value
    const plainText = tempDiv.textContent || tempDiv.innerText
    await navigator.clipboard.writeText(plainText)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

const exportAsDoc = () => {
  const content = editorContent.value
  const blob = new Blob([content], { type: 'application/msword' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedFile.value?.name || selectedDocument.value?.name || 'document'}.doc`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

const exportAsPdf = async () => {
  const element = document.createElement('div')
  element.innerHTML = editorContent.value
  
  const opt = {
    margin: [10, 10, 20, 10] as [number, number, number, number],
    filename: `${selectedFile.value?.name || selectedDocument.value?.name || 'document'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    }
  }
  try {
    const html2pdf = (await import('html2pdf.js')).default
    await html2pdf().set(opt).from(element).save()
  } catch (err) {
    console.error('Failed to export PDF:', err)
  }
}

// Update Quill editor options
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: 'full'
  },
  placeholder: 'Le texte extrait apparaîtra ici...',
  readOnly: computed(() => isProcessing.value || (!selectedFile.value && !selectedDocument.value))
}

// Add ref for Quill instance
const quillInstance = ref<any>(null)

// Add method to handle editor ready
const onEditorReady = (quill: any) => {
  quillInstance.value = quill
  // Enable the editor
  quill.enable()
}

// Remove example text
const exampleText = ''
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
                <div v-show="activeTab === 'upload'" class="space-y-4">
                  <FileUpload
                    :multiple="false"
                    :max-size="10"
                    accept=".pdf,.jpg,.jpeg,.png"
                    show-preview
                    @upload-success="handleUploadSuccess"
                    @upload-error="handleUploadError"
                  />
                  
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
                    <div v-if="recentDocuments.length === 0" class="text-center py-8 text-muted-foreground">
                      <FileText class="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun document récent</p>
                      <p class="text-sm">Commencez par télécharger un document</p>
                    </div>
                    
                    <template v-else>
                      <div
                        v-for="doc in recentDocuments"
                        :key="doc.id"
                        class="group relative flex items-center justify-between p-4 rounded-lg border transition-all hover:border-primary/50 cursor-pointer"
                        :class="{ 
                          'border-primary bg-primary/5': selectedDocument?.name === doc.name,
                          'hover:bg-muted/50': selectedDocument?.name !== doc.name
                        }"
                        @click="handleDocumentSelect(doc)"
                      >
                        <div class="flex items-center gap-4">
                          <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText class="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p class="font-medium">{{ doc.name }}</p>
                            <p class="text-sm text-muted-foreground">
                              {{ doc.language }} · {{ new Date(doc.createdAt).toLocaleDateString() }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" @click.stop="handleDocumentSelect(doc)">
                            <Eye class="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" @click.stop="startOCR">
                            <ImageIcon class="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Text Editor -->
            <Card>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div>
                    <CardTitle>Texte extrait</CardTitle>
                    <CardDescription>Le texte extrait du document apparaîtra ici</CardDescription>
                  </div>
                  <div class="flex items-center gap-2">
                    <Button variant="outline" size="sm" @click="copyText" :disabled="!editorContent">
                      <Copy class="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                    <Button variant="outline" size="sm" @click="exportAsDoc" :disabled="!editorContent">
                      <FileTextIcon class="h-4 w-4 mr-2" />
                      DOC
                    </Button>
                    <Button variant="outline" size="sm" @click="exportAsPdf" :disabled="!editorContent">
                      <FileDown class="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div class="relative">
                  <QuillEditor
                    v-model:content="editorContent"
                    contentType="html"
                    :options="editorOptions"
                    toolbar="full"
                    class="min-height-300"
                    @ready="onEditorReady"
                  />
                  
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

<style>
.min-height-300 {
  min-height: 300px;
}
</style> 