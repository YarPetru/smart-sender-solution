import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/shared/api/errors'

const MAX_QUERY_RETRIES = 2

function isTransientError(error: Error): boolean {
  return isApiError(error) && (error.type === 'NetworkError' || error.status >= 500)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => failureCount < MAX_QUERY_RETRIES && isTransientError(error),
    },
    mutations: {
      retry: false,
    },
  },
})
