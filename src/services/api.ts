import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { RegisterDto, LoginDto, AuthResponse } from '@/types/auth'
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

// User endpoints
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updatePassword: (data: { current_password: string; password: string }) =>
    api.put('/users/password', data),
}

// Document endpoints
export const documents = {
  getAll: (params?: any) => api.get('/documents', { params }),
  get: (id: number) => api.get(`/documents/${id}`),
  create: (data: FormData) => api.post('/documents', data),
  update: (id: number, data: any) => api.put(`/documents/${id}`, data),
  delete: (id: number) => api.delete(`/documents/${id}`),
  restore: (id: number) => api.post(`/documents/${id}/restore`),
  scan: (id: number) => api.post(`/documents/${id}/scan`),
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

export default api 