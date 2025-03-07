<script lang="ts">
export const iframeHeight = '800px'
export const description = 'A left and right sidebar.'
</script>
<script setup lang="ts">
import { ref } from 'vue'
import { Upload, FileText, Search, Loader2, FolderOpen, Image, FileType2, AlertCircle } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const isProcessing = ref(false)
const uploadedFile = ref<File | null>(null)
const processedText = ref('')
const dragOver = ref(false)

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    uploadedFile.value = input.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files.length) {
    uploadedFile.value = event.dataTransfer.files[0]
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
}
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Documents</h1>
        <p class="text-muted-foreground mt-1">Upload and process your documents with OCR</p>
      </div>
      <Button @click="processFile" :disabled="!uploadedFile || isProcessing">
        <Search class="w-4 h-4 mr-2" />
        Process Document
      </Button>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Upload Section -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Upload an image or PDF to extract text</CardDescription>
        </CardHeader>
        <CardContent>
          <div
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
            
            <div v-if="!uploadedFile" class="text-center">
              <Upload class="w-12 h-12 mb-4 mx-auto text-muted-foreground" />
              <label
                for="file-upload"
                class="cursor-pointer text-center"
              >
                <span class="font-medium text-primary hover:underline">Click to upload</span>
                <span class="text-muted-foreground"> or drag and drop</span>
              </label>
              <p class="text-xs text-muted-foreground mt-2">PDF, PNG, JPG up to 10MB</p>
            </div>

            <div v-else class="w-full">
              <div class="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <FileText class="w-8 h-8 text-primary" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ uploadedFile.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ Math.round(uploadedFile.size / 1024) }} KB</p>
                </div>
                <Button variant="destructive" size="sm" @click="uploadedFile = null">
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Info Cards -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supported Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <FileType2 class="w-5 h-5 text-primary" />
                <span>PDF Documents</span>
              </div>
              <div class="flex items-center gap-3">
                <Image class="w-5 h-5 text-primary" />
                <span>Images (PNG, JPG)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-2">
                <AlertCircle class="w-4 h-4 mt-0.5 text-primary" />
                <span>Ensure documents are clear and well-lit</span>
              </div>
              <div class="flex items-start gap-2">
                <AlertCircle class="w-4 h-4 mt-0.5 text-primary" />
                <span>Text should be clearly visible and not blurry</span>
              </div>
              <div class="flex items-start gap-2">
                <AlertCircle class="w-4 h-4 mt-0.5 text-primary" />
                <span>Maximum file size is 10MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Results Section -->
      <Card v-if="processedText" class="lg:col-span-3">
        <CardHeader>
          <CardTitle>Extracted Text</CardTitle>
          <CardDescription>Review and edit the extracted content</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            v-model="processedText"
            class="w-full h-[200px] p-4 rounded-lg border bg-background resize-none"
            placeholder="Processed text will appear here..."
          ></textarea>
        </CardContent>
      </Card>
    </div>
  </div>
</template>