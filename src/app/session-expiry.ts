import { toast } from 'sonner'
import { queryClient } from '@/app/query-client'
import { apiClient } from '@/shared/api/client'
import { authStore } from '@/shared/auth/auth-store'

export function handleSessionExpired(): void {
  const wasAuthenticated = authStore.getStatus() === 'authenticated'
  authStore.signOut('expired')
  queryClient.clear()
  if (wasAuthenticated) {
    toast.error('Session expired. Please sign in again.')
  }
}

export function wireSessionExpiry(): void {
  apiClient.setSessionExpiredHandler(handleSessionExpired)
}
