import { HttpResponse } from 'msw'
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
