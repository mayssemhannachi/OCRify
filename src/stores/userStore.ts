import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { user, type UserProfile, type UpdateUserDto } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  const isLoading = ref(false)
  const userData = ref<UserProfile | null>(null)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const fetchPromise = ref<Promise<UserProfile | null> | null>(null)

  // Computed properties
  const userName = computed(() => {
    if (!userData.value) return 'Utilisateur'
    return `${userData.value.firstName || ''} ${userData.value.lastName || ''}`.trim() || 'Utilisateur'
  })

  const userEmail = computed(() => userData.value?.email || '')

  const userAvatar = computed(() => {
    // First check if we have a valid avatar URL in localStorage
    const storedAvatar = localStorage.getItem('userAvatar')
    if (storedAvatar?.startsWith('https://api.dicebear.com')) {
      return storedAvatar
    }

    // Generate a stable avatar based on email
    const seed = userEmail.value || 'default'
    const avatarUrl = `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(seed)}`
    
    // Store the generated avatar URL
    localStorage.setItem('userAvatar', avatarUrl)
    return avatarUrl
  })

  // Actions
  const fetchUserProfile = async () => {
    // If we're already initialized and have data, return it
    if (isInitialized.value && userData.value) {
      return userData.value
    }

    // If we're already fetching, return the existing promise
    if (fetchPromise.value) {
      return fetchPromise.value
    }

    // Start a new fetch
    fetchPromise.value = (async () => {
      try {
        isLoading.value = true
        console.log('🔵 [userStore] Fetching user profile...')
        const response = await user.getProfile()
        
        if (!response?.data) {
          throw new Error('Invalid profile data received')
        }

        userData.value = response.data
        isInitialized.value = true
        error.value = null
        console.log('✅ [userStore] Profile loaded successfully')
        
        return response.data
      } catch (err: any) {
        console.error('❌ [userStore] Error loading profile:', err)
        error.value = err.message
        return null
      } finally {
        isLoading.value = false
        fetchPromise.value = null
      }
    })()

    return fetchPromise.value
  }

  const updateProfile = async (data: UpdateUserDto) => {
    try {
      isLoading.value = true
      const response = await user.updateProfile(data)
      if (response?.data) {
        userData.value = response.data
      }
      return response
    } catch (err) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    userData.value = null
    error.value = null
    isInitialized.value = false
    fetchPromise.value = null
  }

  return {
    // State
    userData,
    isLoading,
    error,
    isInitialized,
    
    // Getters
    userName,
    userEmail,
    userAvatar,
    
    // Actions
    fetchUserProfile,
    updateProfile,
    reset
  }
}) 