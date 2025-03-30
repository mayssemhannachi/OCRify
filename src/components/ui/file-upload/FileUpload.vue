<!-- FileUpload.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/toast/use-toast'
import { documents } from '@/services/api'

const props = defineProps<{
  multiple?: boolean
  maxSize?: number // in MB
  accept?: string
  showPreview?: boolean
}>()

const emit = defineEmits<{
  (e: 'upload-success', files: File[]): void
  (e: 'upload-error', error: any): void
}>()

const { toast } = useToast()
const dragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])

const maxSizeBytes = computed(() => (props.maxSize || 10) * 1024 * 1024)

const handleFileSelect = (files: FileList | null) => {
  if (!files) return
  
  // Clear previous selections
  selectedFiles.value = []
  previewUrls.value = []
  
  // Filter and validate files
  Array.from(files).forEach(file => {
    if (file.size > maxSizeBytes.value) {
      toast({
        title: 'Fichier trop volumineux',
        description: `${file.name} dépasse la taille maximale de ${props.maxSize}MB`,
        variant: 'destructive'
      })
      return
    }
    
    selectedFiles.value.push(file)
    
    // Generate preview if enabled
    if (props.showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          previewUrls.value.push(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  })
}

const simulateProgress = () => {
  uploadProgress.value = 0
  const interval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 10
    }
  }, 200)
  return interval
}

const handleUpload = async () => {
  if (!selectedFiles.value.length) return
  
  try {
    isUploading.value = true
    const progressInterval = simulateProgress()
    
    if (selectedFiles.value.length > 1) {
      const response = await documents.bulkUpload(selectedFiles.value)
      clearInterval(progressInterval)
      uploadProgress.value = 100
      
      if (response.data?.success) {
        toast({
          title: 'Téléchargement réussi',
          description: `${selectedFiles.value.length} documents ont été téléchargés.`,
        })
        emit('upload-success', selectedFiles.value)
      } else {
        throw new Error('Upload failed')
      }
    } else {
      const response = await documents.upload(selectedFiles.value[0])
      clearInterval(progressInterval)
      uploadProgress.value = 100
      
      if (response.data?.success) {
        toast({
          title: 'Téléchargement réussi',
          description: 'Le document a été téléchargé.',
        })
        emit('upload-success', [selectedFiles.value[0]])
      } else {
        throw new Error('Upload failed')
      }
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    toast({
      title: 'Erreur de téléchargement',
      description: error.response?.data?.message || error.message,
      variant: 'destructive'
    })
    emit('upload-error', error)
  } finally {
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
      selectedFiles.value = []
      previewUrls.value = []
    }, 1000) // Keep success state visible briefly
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  handleFileSelect(event.dataTransfer?.files || null)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div
      class="border-2 border-dashed rounded-lg p-6 transition-all duration-200 relative"
      :class="{
        'border-primary bg-primary/5': dragOver,
        'hover:bg-muted/50': !isUploading,
        'border-muted cursor-not-allowed': isUploading
      }"
      @dragover.prevent="() => dragOver = true"
      @dragleave.prevent="() => dragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        :multiple="props.multiple"
        :accept="props.accept"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        :class="{ 'pointer-events-none': isUploading }"
        @change="(e) => handleFileSelect(e.target.files)"
      />
      
      <div class="flex flex-col items-center justify-center gap-2">
        <div class="rounded-full p-3 bg-primary/10">
          <Upload v-if="!isUploading" class="h-6 w-6 text-primary animate-pulse" />
          <Loader2 v-else class="h-6 w-6 text-primary animate-spin" />
        </div>
        
        <div class="text-center">
          <p class="text-sm font-medium">
            {{ isUploading ? 'Téléchargement en cours...' : 'Glissez vos documents ici' }}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            {{ isUploading ? 'Veuillez patienter' : 'ou cliquez pour sélectionner' }}
          </p>
          <p v-if="!isUploading" class="text-xs text-muted-foreground mt-1">
            PDF, JPG, PNG (max {{ props.maxSize || 10 }}MB)
          </p>
        </div>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="isUploading" class="mt-4">
        <Progress :value="uploadProgress" class="h-1">
          <div
            class="h-full bg-primary transition-all duration-500"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </Progress>
        <p class="text-xs text-center text-muted-foreground mt-2">
          {{ Math.round(uploadProgress) }}%
        </p>
      </div>
    </div>
    
    <!-- Selected Files Preview -->
    <div v-if="selectedFiles.length && !isUploading" class="space-y-2">
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="flex items-center gap-3 p-2 rounded-lg bg-muted/50 group animate-in slide-in-from-left"
      >
        <div class="h-10 w-10 rounded bg-background flex items-center justify-center shrink-0">
          <FileText class="h-5 w-5 text-primary" />
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ file.name }}</p>
          <p class="text-xs text-muted-foreground">
            {{ (file.size / 1024 / 1024).toFixed(2) }} MB
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
          @click="removeFile(index)"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
      
      <div class="flex justify-end">
        <Button
          :disabled="isUploading"
          @click="handleUpload"
          class="transition-all duration-200"
        >
          <Upload v-if="!isUploading" class="h-4 w-4 mr-2" />
          <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
          {{ isUploading ? 'Téléchargement...' : 'Télécharger' }}
        </Button>
      </div>
    </div>
  </div>
</template> 