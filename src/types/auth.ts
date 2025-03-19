export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    refreshToken?: string
    user: User
  }
} 