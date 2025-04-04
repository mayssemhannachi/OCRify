<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { documents as documentsService } from '@/services/api'
import type { DashboardDataDto } from '@/types/documents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle2, Clock, HardDrive, AlertCircle, Activity } from 'lucide-vue-next'

const dashboardData = ref<DashboardDataDto | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    console.log('🔵 [Dashboard] Starting to fetch dashboard data')
    const response = await documentsService.getRecent()
    console.log('✅ [Dashboard] Received response:', response)
    
    if (response.data.success) {
      console.log('✅ [Dashboard] Setting dashboard data:', response.data.data)
      dashboardData.value = response.data.data
      
      // Log statistics
      console.log('📊 [Dashboard] Statistics:', {
        totalDocuments: dashboardData.value.totalDocuments,
        processedDocuments: dashboardData.value.processedDocuments,
        successRate: dashboardData.value.processingSuccessRate,
        storageUsed: formatFileSize(dashboardData.value.totalStorageUsed),
        processingTime: formatTime(dashboardData.value.averageProcessingTime)
      })
      
      // Log document status distribution
      console.log('📈 [Dashboard] Document Status Distribution:', dashboardData.value.documentsByStatus)
      
      // Log language distribution
      console.log('🌐 [Dashboard] Language Distribution:', dashboardData.value.documentsByLanguage)
      
      // Log recent documents
      console.log('📄 [Dashboard] Recent Documents:', dashboardData.value.recentDocuments.map(doc => ({
        id: doc.id,
        name: doc.fileName,
        status: doc.status,
        language: doc.language
      })))
      
      // Log recent activity
      console.log('⚡ [Dashboard] Recent Activity:', dashboardData.value.recentActivity.map(activity => ({
        id: activity.id,
        action: activity.action,
        timestamp: activity.timestamp
      })))
      
      // Log processing statistics
      console.log('⚙️ [Dashboard] Processing Statistics:', {
        inProcessing: dashboardData.value.documentsInProcessing,
        failed: dashboardData.value.failedDocuments,
        avgTime: formatTime(dashboardData.value.averageProcessingTime)
      })
    } else {
      console.error('❌ [Dashboard] API returned error:', response.data.message)
      error.value = response.data.message
    }
  } catch (err: any) {
    console.error('❌ [Dashboard] Error fetching dashboard data:', err)
    console.error('❌ [Dashboard] Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })
    error.value = err.message || 'Failed to fetch dashboard data'
  } finally {
    isLoading.value = false
    console.log('🏁 [Dashboard] Data fetching completed')
  }
}

onMounted(() => {
  console.log('🚀 [Dashboard] Component mounted, fetching data...')
  fetchDashboardData()
})

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  console.log('📏 [Dashboard] Formatting file size:', bytes)
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  console.log('📏 [Dashboard] Formatted size:', result)
  return result
}

// Helper function to format time
const formatTime = (minutes: number) => {
  console.log('⏱️ [Dashboard] Formatting time:', minutes)
  if (minutes < 60) {
    const result = `${Math.round(minutes)}m`
    console.log('⏱️ [Dashboard] Formatted time:', result)
    return result
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  const result = `${hours}h ${remainingMinutes}m`
  console.log('⏱️ [Dashboard] Formatted time:', result)
  return result
}

// Add logging to template watchers
watch(() => dashboardData.value, (newData) => {
  console.log('👀 [Dashboard] Dashboard data updated:', {
    hasData: !!newData,
    totalDocuments: newData?.totalDocuments,
    processedDocuments: newData?.processedDocuments
  })
}, { deep: true })

watch(() => isLoading.value, (newValue) => {
  console.log('🔄 [Dashboard] Loading state changed:', newValue)
})

watch(() => error.value, (newValue) => {
  console.log('⚠️ [Dashboard] Error state changed:', newValue)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Documents</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ dashboardData?.totalDocuments || 0 }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Processed Documents</CardTitle>
          <CheckCircle2 class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ dashboardData?.processedDocuments || 0 }}</div>
          <p class="text-xs text-muted-foreground">
            {{ dashboardData?.processingSuccessRate.toFixed(1) || 0 }}% success rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Storage Used</CardTitle>
          <HardDrive class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatFileSize(dashboardData?.totalStorageUsed || 0) }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Processing Time</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatTime(dashboardData?.averageProcessingTime || 0) }}</div>
          <p class="text-xs text-muted-foreground">Average processing time</p>
        </CardContent>
      </Card>
    </div>

    <!-- Processing Status -->
    <Card>
      <CardHeader>
        <CardTitle>Processing Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="text-center py-4">
          Loading...
        </div>
        <div v-else-if="error" class="text-center py-4 text-red-500">
          {{ error }}
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">In Processing</span>
              <span class="text-sm text-muted-foreground">{{ dashboardData?.documentsInProcessing || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Failed Documents</span>
              <span class="text-sm text-red-500">{{ dashboardData?.failedDocuments || 0 }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div v-for="(count, status) in dashboardData?.documentsByStatus" :key="status" class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ status }}</span>
              <span class="text-sm text-muted-foreground">{{ count }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Language Distribution -->
    <Card>
      <CardHeader>
        <CardTitle>Language Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="text-center py-4">
          Loading...
        </div>
        <div v-else-if="error" class="text-center py-4 text-red-500">
          {{ error }}
        </div>
        <div v-else class="space-y-2">
          <div v-for="(count, language) in dashboardData?.documentsByLanguage" :key="language" class="flex items-center justify-between">
            <span class="text-sm font-medium">{{ language }}</span>
            <span class="text-sm text-muted-foreground">{{ count }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Activity -->
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="text-center py-4">
          Loading...
        </div>
        <div v-else-if="error" class="text-center py-4 text-red-500">
          {{ error }}
        </div>
        <div v-else-if="dashboardData?.recentActivity.length === 0" class="text-center py-4 text-muted-foreground">
          No recent activity
        </div>
        <div v-else class="space-y-4">
          <div v-for="activity in dashboardData?.recentActivity" :key="activity.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p class="font-medium">{{ activity.action }}</p>
              <p class="text-sm text-muted-foreground">{{ activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A' }}</p>
            </div>
            <Activity class="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Documents -->
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="text-center py-4">
          Loading...
        </div>
        <div v-else-if="error" class="text-center py-4 text-red-500">
          {{ error }}
        </div>
        <div v-else-if="dashboardData?.recentDocuments.length === 0" class="text-center py-4 text-muted-foreground">
          No recent documents
        </div>
        <div v-else class="space-y-4">
          <div v-for="doc in dashboardData?.recentDocuments" :key="doc.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 class="font-medium">{{ doc.fileName }}</h3>
              <p class="text-sm text-muted-foreground">{{ doc.language }} • {{ doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A' }}</p>
            </div>
            <div class="text-sm text-muted-foreground">
              {{ doc.status === 4 ? 'Processed' : 'Processing' }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template> 