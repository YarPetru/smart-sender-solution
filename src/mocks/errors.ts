import { HttpResponse } from 'msw'
import type { z } from 'zod'
import type { ContractErrorType, ErrorEnvelope, ValidationPayload } from '@/shared/api/contract'

export function errorResponse(
  status: number,
  type: ContractErrorType,
  message: string,
  payload?: ValidationPayload,
) {
  const envelope: ErrorEnvelope = {
    error: payload === undefined ? { type, message } : { type, message, payload },
  }
  return HttpResponse.json(envelope, { status })
}

export function validationErrorResponse(payload: ValidationPayload) {
  return errorResponse(422, 'ValidationException', 'The given data was invalid.', payload)
}

export function toValidationPayload(error: z.ZodError): ValidationPayload {
  const payload: ValidationPayload = {}
  for (const issue of error.issues) {
    const [firstSegment] = issue.path
    const field = typeof firstSegment === 'string' ? firstSegment : 'body'
    payload[field] = [...(payload[field] ?? []), issue.message]
  }
  return payload
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    const body: unknown = await request.json()
    return body
  } catch {
    return null
  }
}
