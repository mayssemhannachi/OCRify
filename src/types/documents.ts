export interface BackendDocumentDto {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  status: number
  language: string
  topic?: string
  description?: string
  tags: string[]
  isFavorite: boolean
  uploadDate: string
  lastModified?: string
  ocrText?: string
  enhancedText?: string
  errorMessage?: string
  pageCount?: number
  corrections: any[]
  accuracy?: number
  isDeleted: boolean
}

export interface DocumentDto {
  id: string
  name: string
  path: string
  size: number
  type: string
  status: string
  language: string
  topic?: string
  description?: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  accuracy?: number
  thumbnail?: string
  isDeleted: boolean
}

export interface DocumentSearchResultDto {
  success: boolean
  message: string
  data: {
    items: BackendDocumentDto[]
    totalCount: number
    pageSize: number
    currentPage: number
  }
}

export interface DocumentSearchDto {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
  includeDeletedNum?: number;
  searchTerm?: string;
  type?: string;
  language?: string;
  status?: number;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  favoritesOnly?: boolean;
}

export interface DashboardDataDto {
  // Basic Statistics
  totalDocuments: number
  processedDocuments: number
  processingSuccessRate: number
  totalStorageUsed: number

  // Document Status Statistics
  documentsByStatus: Record<string, number>
  
  // Language Statistics
  documentsByLanguage: Record<string, number>
  
  // Recent Documents
  recentDocuments: BackendDocumentDto[]
  
  // Recent Activity
  recentActivity: Array<{
    id: string
    userId: string
    action: string
    timestamp: string
  }>
  
  // Processing Statistics
  documentsInProcessing: number
  failedDocuments: number
  averageProcessingTime: number
}

export interface DashboardResponse {
  success: boolean
  message: string
  data: DashboardDataDto
} 