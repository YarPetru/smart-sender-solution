import {
  errorEnvelopeSchema,
  type ContractErrorType,
  type ValidationPayload,
} from '@/shared/api/contract'

type ClientErrorType = 'NetworkError' | 'SessionExpired' | 'ResponseParseError' | 'UnknownError'

export type ApiErrorType = ContractErrorType | ClientErrorType | (string & {})

type ApiErrorInit = {
  status: number
  type: ApiErrorType
  message: string
  payload?: ValidationPayload | undefined
  cause?: unknown
}

export class ApiError extends Error {
  override readonly name = 'ApiError'
  readonly status: number
  readonly type: ApiErrorType
  readonly payload: ValidationPayload | undefined

  constructor({ status, type, message, payload, cause }: ApiErrorInit) {
    super(message, { cause })
    this.status = status
    this.type = type
    this.payload = payload
  }
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    const body: unknown = await response.json()
    return body
  } catch {
    return null
  }
}

export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  const parsed = errorEnvelopeSchema.safeParse(await readJsonSafely(response))
  if (!parsed.success) {
    return new ApiError({
      status: response.status,
      type: 'UnknownError',
      message: `Request failed with status ${String(response.status)}`,
    })
  }
  const { type, message, payload } = parsed.data.error
  return new ApiError({ status: response.status, type, message, payload })
}

export function createNetworkError(cause: unknown): ApiError {
  return new ApiError({
    status: 0,
    type: 'NetworkError',
    message: 'Network error. Check your connection and try again.',
    cause,
  })
}

export function createSessionExpiredError(cause?: unknown): ApiError {
  return new ApiError({
    status: 401,
    type: 'SessionExpired',
    message: 'Session expired. Please sign in again.',
    cause,
  })
}

export function createResponseParseError(status: number, cause: unknown): ApiError {
  return new ApiError({
    status,
    type: 'ResponseParseError',
    message: 'Unexpected response from the server.',
    cause,
  })
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isValidationError(
  error: unknown,
): error is ApiError & { payload: ValidationPayload } {
  return isApiError(error) && error.status === 422 && error.payload !== undefined
}

export function isNotFound(error: unknown): error is ApiError {
  return isApiError(error) && error.status === 404
}

export function getErrorMessage(error: unknown): string {
  return isApiError(error) ? error.message : 'Something went wrong. Please try again.'
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
