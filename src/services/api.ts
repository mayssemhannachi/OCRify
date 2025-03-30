import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { RegisterDto, LoginDto, AuthResponse } from '@/types/auth'
import type { BackendDocumentDto, DocumentSearchResultDto, DocumentSearchDto } from '@/types/documents'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await auth.refresh(refreshToken)
          if (response.data.success && response.data.data?.token) {
            // Update the token
            localStorage.setItem('token', response.data.data.token)
            if (response.data.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.data.refreshToken)
            }

            // Retry the original request
            originalRequest.headers['Authorization'] = `Bearer ${response.data.data.token}`
            originalRequest.headers['X-Retry'] = 'true'
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }
    }

    // If we get here, either the refresh failed or we've already tried to refresh
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.push('/sign-in')
    }

    return Promise.reject(error)
  }
)

interface ResetPasswordDto {
  email: string
  token: string
  newPassword: string
}

interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface DocumentUploadResponse {
  success: boolean
  message: string
  data?: {
    id: string
    name: string
    path: string
    size: number
    type: string
    uploadedAt: string
  }
}

interface BulkUploadResponse {
  success: boolean
  message: string
  data?: {
    uploadedFiles: Array<{
      id: string
      name: string
      path: string
      size: number
      type: string
      uploadedAt: string
    }>
    failedFiles?: Array<{
      name: string
      error: string
    }>
  }
}

interface DocumentDto {
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
}

// Auth endpoints
export const auth = {
  register: (data: RegisterDto) =>
    api.post<AuthResponse>('/api/Auth/register', data),
  login: (data: LoginDto) =>
    api.post<AuthResponse>('/api/Auth/login', data),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/api/Auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/api/Auth/forgot-password', { email }),
  resetPassword: (data: ResetPasswordDto) =>
    api.post('/api/Auth/reset-password', data),
  changePassword: (data: ChangePasswordDto) =>
    api.post('/api/Auth/change-password', data),
  logout: async () => {
    try {
      const response = await api.post('/api/Auth/logout')
      // Clear auth headers after successful logout
      delete api.defaults.headers.common['Authorization']
      return response
    } catch (error) {
      // Even if the request fails, clear the headers
      delete api.defaults.headers.common['Authorization']
      throw error
    }
  },
}

// User DTOs
interface UpdateUserDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  company?: string
  birthDate?: string
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phone?: string
  address?: string
  company?: string
  birthDate?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  deletedAt: string | null
  deletedBy: string | null
  isDeleted: boolean
}

// User service
const user = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>('/api/Users/me')
    return response.data
  },

  async updateProfile(data: UpdateUserDto) {
    try {
      console.log('🔵 [updateProfile] Input data:', data)

      // Only send fields that are present in the data object
      const requestData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.phone && { phone: data.phone }),
        ...(data.address && { address: data.address }),
        ...(data.company && { company: data.company }),
        ...(data.birthDate && { birthDate: data.birthDate })
      }

      console.log('🔵 [updateProfile] Prepared request data:', requestData)
      console.log('🔵 [updateProfile] Request URL:', `${api.defaults.baseURL}/api/Users/me`)
      console.log('🔵 [updateProfile] Request headers:', api.defaults.headers)

      const response = await api.put<ApiResponse<UserProfile>>('/api/Users/me', requestData)
      console.log('✅ [updateProfile] Success response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ [updateProfile] Error:', error)
      console.error('❌ [updateProfile] Error response:', error.response?.data)
      throw error
    }
  },
}

// User endpoints
export const users = {
  getProfile: () => api.get('/api/Users/me'),
  updateProfile: (data: UpdateUserDto) => user.updateProfile(data),
  updatePassword: (data: { current_password: string; password: string }) =>
    api.put('/api/Auth/change-password', data),
}

// Document endpoints
export const documents = {
  getAll: async (params?: DocumentSearchDto) => {
    try {
      console.log('🔵 [documents.getAll] Raw params:', params);
      
      // Ensure params is an object
      const searchParams = params || {};
      
      // Convert boolean includeDeleted to number
      if (typeof searchParams.includeDeleted === 'boolean') {
        searchParams.includeDeletedNum = searchParams.includeDeleted ? 1 : 0;
      }
      
      // Convert dates to ISO strings if they exist
      if (searchParams.dateFrom instanceof Date) {
        searchParams.dateFrom = searchParams.dateFrom.toISOString();
      }
      if (searchParams.dateTo instanceof Date) {
        searchParams.dateTo = searchParams.dateTo.toISOString();
      }
      
      console.log('🔵 [documents.getAll] Serialized params:', searchParams);
      
      const response = await api.get('/api/Documents', { params: searchParams });
      console.log('✅ [documents.getAll] Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [documents.getAll] Error fetching documents:', error);
      throw error;
    }
  },
  get: (id: number) => api.get(`/documents/${id}`),
  updateFavorite: async (id: string, isFavorite: boolean) => {
    try {
      console.log('🔵 [documents.updateFavorite] Updating favorite status:', { id, isFavorite })
      
      // First get the current document
      const currentDoc = await documents.getById(id)
      if (!currentDoc.data?.success || !currentDoc.data?.data) {
        throw new Error('Failed to fetch current document')
      }

      const doc = currentDoc.data.data
      
      // Convert language string to enum value
      const languageMap: { [key: string]: number } = {
        'English': 0,
        'French': 1,
        'Arabic': 2
      }
      const language = languageMap[doc.language] || 0 // Default to English if unknown
      
      // Update with existing values plus the new favorite status
      const response = await api.put<ApiResponse<DocumentDto>>(`/api/Documents/${id}`, {
        language: language,
        topic: doc.topic || '',
        description: doc.description || '',
        tags: doc.tags || [],
        isFavorite: isFavorite
      })
      
      console.log('✅ [documents.updateFavorite] Favorite status updated successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [documents.updateFavorite] Error updating favorite status:', error)
      throw error
    }
  },
  create: (data: FormData) => api.post('/documents', data),
  delete: async (id: string) => {
    try {
      console.log('🔵 [documents.delete] Deleting document:', id)
      const response = await api.delete<ApiResponse<void>>(`/api/Documents/${id}`)
      console.log('✅ [documents.delete] Document deleted successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [documents.delete] Error deleting document:', error)
      throw error
    }
  },
  restore: async (id: string) => {
    try {
      console.log('🔵 [documents.restore] Restoring document:', id)
      const response = await api.post<ApiResponse<void>>(`/api/Documents/${id}/restore`)
      console.log('✅ [documents.restore] Document restored successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [documents.restore] Error restoring document:', error)
      throw error
    }
  },
  permanentDelete: async (id: string) => {
    try {
      console.log('🔵 [documents.permanentDelete] Permanently deleting document:', id)
      const response = await api.delete<ApiResponse<void>>(`/api/Documents/${id}/permanent`)
      console.log('✅ [documents.permanentDelete] Document permanently deleted successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [documents.permanentDelete] Error permanently deleting document:', error)
      throw error
    }
  },
  bulkDelete: async (ids: string[]) => {
    try {
      console.log('🔵 [documents.bulkDelete] Bulk deleting documents:', ids)
      const response = await api.post<ApiResponse<void>>('/api/Documents/bulk-delete', ids)
      console.log('✅ [documents.bulkDelete] Documents bulk deleted successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [documents.bulkDelete] Error bulk deleting documents:', error)
      throw error
    }
  },
  bulkRestore: async (ids: string[]) => {
    try {
      console.log('🔵 [documents.bulkRestore] Bulk restoring documents:', ids)
      const response = await api.post<ApiResponse<void>>('/api/Documents/bulk-restore', ids)
      console.log('✅ [documents.bulkRestore] Documents bulk restored successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [documents.bulkRestore] Error bulk restoring documents:', error)
      throw error
    }
  },
  bulkPermanentDelete: async (ids: string[]) => {
    try {
      console.log('🔵 [documents.bulkPermanentDelete] Input array:', ids)
      console.log('🔵 [documents.bulkPermanentDelete] Request URL:', `${api.defaults.baseURL}/api/Documents/bulk-permanent-delete`)
      console.log('🔵 [documents.bulkPermanentDelete] Request headers:', api.defaults.headers)
      console.log('🔵 [documents.bulkPermanentDelete] Request body:', JSON.stringify(ids, null, 2))
      
      const response = await api.post<ApiResponse<void>>('/api/Documents/bulk-permanent-delete', ids)
      console.log('✅ [documents.bulkPermanentDelete] Response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ [documents.bulkPermanentDelete] Error:', error)
      console.error('❌ [documents.bulkPermanentDelete] Request config:', error.config)
      console.error('❌ [documents.bulkPermanentDelete] Request data:', error.config?.data)
      console.error('❌ [documents.bulkPermanentDelete] Response data:', error.response?.data)
      throw error
    }
  },
  scan: (id: number) => api.post(`/documents/${id}/scan`),
  upload: async (file: File, metadata?: { [key: string]: any }) => {
    try {
      console.log('🔵 [documents.upload] Preparing to upload file:', file.name)
      const formData = new FormData()
      formData.append('file', file)
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata))
      }
      
      const response = await api.post<DocumentUploadResponse>('/api/Documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('✅ [documents.upload] Upload successful:', response.data)
      return response
    } catch (error: any) {
      console.error('❌ [documents.upload] Upload failed:', error.response?.data || error.message)
      throw error
    }
  },
  bulkUpload: async (files: File[]) => {
    try {
      console.log('🔵 [documents.bulkUpload] Preparing to upload', files.length, 'files')
      const formData = new FormData()
      
      // Create DocumentUploadDto objects for each file
      files.forEach((file, index) => {
        formData.append(`uploadDtos[${index}].File`, file)
        formData.append(`uploadDtos[${index}].Language`, '1') // French = 1 in the enum
        formData.append(`uploadDtos[${index}].Topic`, '') // Optional
        formData.append(`uploadDtos[${index}].Description`, '') // Optional
        formData.append(`uploadDtos[${index}].Tags`, '[]') // Empty array as string
        formData.append(`uploadDtos[${index}].IsFavorite`, 'false')
      })
      
      const response = await api.post<BulkUploadResponse>('/api/Documents/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('✅ [documents.bulkUpload] Upload successful:', response.data)
      return response
    } catch (error: any) {
      console.error('❌ [documents.bulkUpload] Upload failed:', error.response?.data || error.message)
      throw error
    }
  },
  getRecent: async () => {
    try {
      console.log('🔵 [documents.getRecent] Fetching recent documents')
      const response = await api.get('/api/Documents/dashboard')
      console.log('✅ [documents.getRecent] Documents fetched successfully:', response.data)
      return response
    } catch (error: any) {
      console.error('❌ [documents.getRecent] Failed to fetch documents:', error.response?.data || error.message)
      throw error
    }
  },
  getById: async (id: string) => {
    try {
      console.log('🔵 [documents.getById] Fetching document:', id)
      const response = await api.get(`/api/Documents/${id}`)
      console.log('✅ [documents.getById] Document fetched successfully:', response.data)
      return response
    } catch (error: any) {
      console.error('❌ [documents.getById] Failed to fetch document:', error.response?.data || error.message)
      throw error
    }
  },
  update: async (id: string, data: any) => {
    try {
      console.log('🔵 [documents.update] Updating document:', id)
      const response = await api.put(`/api/Documents/${id}`, data)
      console.log('✅ [documents.update] Document updated successfully:', response.data)
      return response
    } catch (error: any) {
      console.error('❌ [documents.update] Failed to update document:', error.response?.data || error.message)
      throw error
    }
  },
  getDocumentContent: async (id: string) => {
    return await api.get(`/api/Documents/${id}/content`, {
      responseType: 'blob'
    })
  },
  getFile: async (docId: string) => {
    try {
      console.log('🔵 [documents.getFile] Fetching file for document:', docId)
      const response = await api.get(`/api/Documents/${docId}/download`, {
        responseType: 'blob'
      })
      console.log('✅ [documents.getFile] File fetched successfully')
      return response
    } catch (error: any) {
      console.error('❌ [documents.getFile] Failed to fetch file:', error.response?.data || error.message)
      throw error
    }
  }
}

// OCR endpoints
export const ocr = {
  process: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/ocr/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getLanguages: () => api.get('/ocr/languages'),
}

// Export all services and types
export { user }
export type { RegisterDto, LoginDto, AuthResponse, UpdateUserDto, UserProfile, ApiResponse }
export default api 