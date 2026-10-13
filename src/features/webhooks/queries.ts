import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getWebhook, listWebhooks, updateWebhook } from '@/features/webhooks/api'
import type { UpdateWebhookRequest } from '@/shared/api/contract'

export const WEBHOOKS_PAGE_SIZE = 10

export type WebhookListParams = {
  page: number
  search: string
}

export const webhookKeys = {
  all: ['webhooks'] as const,
  lists: () => [...webhookKeys.all, 'list'] as const,
  list: (params: WebhookListParams) => [...webhookKeys.lists(), params] as const,
  detail: (id: string) => [...webhookKeys.all, 'detail', id] as const,
}

export function useWebhooks({ page, search }: WebhookListParams) {
  return useQuery({
    queryKey: webhookKeys.list({ page, search }),
    queryFn: ({ signal }) => listWebhooks({ page, search, limit: WEBHOOKS_PAGE_SIZE }, signal),
    placeholderData: keepPreviousData,
  })
}

export function useWebhook(id: string) {
  return useQuery({
    queryKey: webhookKeys.detail(id),
    queryFn: ({ signal }) => getWebhook(id, signal),
  })
}

export function useUpdateWebhook(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateWebhookRequest) => updateWebhook(id, body),
    onSuccess: (webhook) => {
      queryClient.setQueryData(webhookKeys.detail(id), webhook)
      void queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
    },
  })
}
