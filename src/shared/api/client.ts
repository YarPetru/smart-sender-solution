import { createHttpClient } from '@/shared/api/http-client'

export const apiClient = createHttpClient({ baseUrl: window.location.origin })
