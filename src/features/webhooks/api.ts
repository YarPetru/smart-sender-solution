import { apiClient } from '@/shared/api/client'
import {
  webhookListSchema,
  webhookSchema,
  type UpdateWebhookRequest,
  type Webhook,
  type WebhookList,
  type WebhookListQuery,
} from '@/shared/api/contract'

function webhookPath(id: string): string {
  return `/v1/webhooks/${encodeURIComponent(id)}`
}

export function listWebhooks(query: WebhookListQuery, signal?: AbortSignal): Promise<WebhookList> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) })
  if (query.search !== '') {
    params.set('search', query.search)
  }
  return apiClient.get(`/v1/webhooks?${params.toString()}`, webhookListSchema, { signal })
}

export function getWebhook(id: string, signal?: AbortSignal): Promise<Webhook> {
  return apiClient.get(webhookPath(id), webhookSchema, { signal })
}

export function updateWebhook(id: string, body: UpdateWebhookRequest): Promise<Webhook> {
  return apiClient.put(webhookPath(id), body, webhookSchema)
}
