import { authHandlers } from '@/mocks/handlers/auth'
import { csrfHandlers } from '@/mocks/handlers/csrf'
import { meHandlers } from '@/mocks/handlers/me'
import { webhookHandlers } from '@/mocks/handlers/webhooks'

export const handlers = [...csrfHandlers, ...authHandlers, ...meHandlers, ...webhookHandlers]
