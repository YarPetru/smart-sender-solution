import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { findWebhook, getAllWebhooks, updateWebhook } from '@/mocks/db'
import {
  errorResponse,
  readJsonBody,
  toValidationPayload,
  validationErrorResponse,
} from '@/mocks/errors'
import { simulateNetworkLatency, withAuth, withCsrf, withXhrWarning } from '@/mocks/guards'
import type { WebhookList } from '@/shared/api/contract'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).catch(DEFAULT_LIMIT),
  search: z.string().trim().toLowerCase().catch(''),
})

const NAME_REQUIRED = 'The name field is required.'
const URL_INVALID = 'The url must be a valid URL.'

function isHttpUrl(value: string): boolean {
  const url = URL.parse(value)
  return url !== null && (url.protocol === 'http:' || url.protocol === 'https:')
}

const updateBodySchema = z.object({
  name: z
    .string({ error: NAME_REQUIRED })
    .trim()
    .min(1, NAME_REQUIRED)
    .max(255, 'The name may not be greater than 255 characters.'),
  url: z.string({ error: URL_INVALID }).trim().refine(isHttpUrl, URL_INVALID),
})

function notFoundResponse() {
  return errorResponse(404, 'NotFoundException', 'Webhook not found.')
}

export const webhookHandlers = [
  http.get(
    '*/v1/webhooks',
    withXhrWarning(
      withAuth(async ({ request }) => {
        await simulateNetworkLatency()
        const searchParams = new URL(request.url).searchParams
        const { page, limit, search } = listQuerySchema.parse({
          page: searchParams.get('page') ?? undefined,
          limit: searchParams.get('limit') ?? undefined,
          search: searchParams.get('search') ?? undefined,
        })
        const filtered = getAllWebhooks().filter((webhook) =>
          webhook.name.toLowerCase().includes(search),
        )
        const total = filtered.length
        const response: WebhookList = {
          data: filtered.slice((page - 1) * limit, page * limit),
          paging: {
            pages: { current: page, last: Math.max(1, Math.ceil(total / limit)) },
            results: { total, limitation: limit },
          },
        }
        return HttpResponse.json(response)
      }),
    ),
  ),

  http.get<{ id: string }>(
    '*/v1/webhooks/:id',
    withXhrWarning(
      withAuth(async ({ params }) => {
        await simulateNetworkLatency()
        const webhook = findWebhook(params.id)
        if (webhook === undefined) {
          return notFoundResponse()
        }
        return HttpResponse.json(webhook)
      }),
    ),
  ),

  http.put<{ id: string }>(
    '*/v1/webhooks/:id',
    withXhrWarning(
      withCsrf(
        withAuth(async ({ params, request }) => {
          await simulateNetworkLatency()
          if (findWebhook(params.id) === undefined) {
            return notFoundResponse()
          }
          const parsed = updateBodySchema.safeParse(await readJsonBody(request))
          if (!parsed.success) {
            return validationErrorResponse(toValidationPayload(parsed.error))
          }
          const updated = updateWebhook(params.id, parsed.data)
          if (updated === undefined) {
            return notFoundResponse()
          }
          return HttpResponse.json(updated)
        }),
      ),
    ),
  ),
]
