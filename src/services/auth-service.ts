import { auth, user, type UserProfile } from './api'
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

  static async setUser(userData: any): Promise<void> {
    try {
      // Get the full user profile
      const response = await user.getProfile()
      if (response.success && response.data) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data))
      } else {
        console.error('Failed to get user profile:', response.message)
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // If we can't get the profile, store what we have
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData))
    }
  }

  static getUser(): UserProfile | null {
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