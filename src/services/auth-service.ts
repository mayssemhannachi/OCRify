import { auth } from './api'
import router from '@/router'

export class AuthService {
  private static TOKEN_KEY = 'token'
  private static USER_KEY = 'user'

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY)
  }

  static setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static getUser(): any {
    const user = localStorage.getItem(this.USER_KEY)
    if (!user) return null
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY)
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  static async logout(): Promise<void> {
    try {
      // Call the backend logout endpoint
      await auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Even if the backend call fails, we still want to clear local storage
    } finally {
      // Clear all auth-related data
      this.removeToken()
      this.removeUser()
      
      // Clear any other auth-related data that might be in localStorage
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('authState')
      
      // Use router navigation instead of page reload
      router.push('/sign-in')
    }
  }
} 