import { z } from 'zod'

export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  name: z.string(),
})
export type Me = z.infer<typeof meSchema>

export const webhookSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  active: z.boolean(),
  created_at: z.iso.datetime(),
})
export type Webhook = z.infer<typeof webhookSchema>

export const webhookListSchema = z.object({
  data: z.array(webhookSchema),
  paging: z.object({
    pages: z.object({
      current: z.number().int(),
      last: z.number().int(),
    }),
    results: z.object({
      total: z.number().int(),
      limitation: z.number().int(),
    }),
  }),
})
export type WebhookList = z.infer<typeof webhookListSchema>

export type WebhookListQuery = {
  page: number
  limit: number
  search: string
}

export const loginRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
  fingerprint: z.string(),
})
export type LoginRequest = z.infer<typeof loginRequestSchema>

export const loginResponseSchema = z.object({
  device_session_token: z.string(),
})
export type LoginResponse = z.infer<typeof loginResponseSchema>

export const issueTokenRequestSchema = z.object({
  device_session_token: z.string(),
  fingerprint: z.string(),
})
export type IssueTokenRequest = z.infer<typeof issueTokenRequestSchema>

export const rotateTokenRequestSchema = z.object({
  fingerprint: z.string(),
})
export type RotateTokenRequest = z.infer<typeof rotateTokenRequestSchema>

export const revokeTokenRequestSchema = z.object({
  fingerprint: z.string(),
})
export type RevokeTokenRequest = z.infer<typeof revokeTokenRequestSchema>

export const updateWebhookRequestSchema = z.object({
  name: z.string(),
  url: z.string(),
})
export type UpdateWebhookRequest = z.infer<typeof updateWebhookRequestSchema>

export type ContractErrorType =
  | 'BadRequestException'
  | 'AuthenticationException'
  | 'NotFoundException'
  | 'TokenMismatchException'
  | 'ValidationException'

export const validationPayloadSchema = z.record(z.string(), z.array(z.string()))
export type ValidationPayload = z.infer<typeof validationPayloadSchema>

export const errorEnvelopeSchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
    payload: validationPayloadSchema.optional(),
  }),
})
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>
