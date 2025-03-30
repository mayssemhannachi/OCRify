import { ref } from 'vue'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration = 3000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast = { id, title, description, variant, duration }
    toasts.value.push(newToast)
    
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }
  
  return {
    toast,
    toasts
  }
} 