import type { z } from 'zod'
import {
  ApiError,
  apiErrorFromResponse,
  createNetworkError,
  createResponseParseError,
  createSessionExpiredError,
  isAbortError,
} from '@/shared/api/errors'
import { getFingerprint as getDeviceFingerprint } from '@/shared/auth/fingerprint'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type HttpClientOptions = {
  baseUrl: string
  onSessionExpired?: () => void
  getFingerprint?: () => string
}

export type RequestOptions = {
  method: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  skipRefresh?: boolean
  signal?: AbortSignal
}

export type CallOptions = Omit<RequestOptions, 'method' | 'body'>

type RetryState = {
  csrfRetried: boolean
  sessionRetried: boolean
}

const CSRF_PATH = '/csrf'
const ROTATE_PATH = '/auth/token/rotate'
const CSRF_HEADER = 'X-CSRF-TOKEN'

export function createHttpClient({
  baseUrl,
  onSessionExpired,
  getFingerprint = getDeviceFingerprint,
}: HttpClientOptions) {
  let csrfToken: string | null = null
  let csrfPromise: Promise<string> | null = null
  let refreshPromise: Promise<void> | null = null
  let sessionGeneration = 0
  let refreshCycle = 0
  let expiredRefreshCycle: number | null = null
  let sessionExpiredHandler = onSessionExpired

  function setSessionExpiredHandler(handler: (() => void) | undefined): void {
    sessionExpiredHandler = handler
  }

  async function send(
    path: string,
    options: RequestOptions,
    csrf: string | null,
  ): Promise<Response> {
    const headers = new Headers(options.headers)
    headers.set('X-Requested-With', 'XMLHttpRequest')
    headers.set('Accept', 'application/json')
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }
    if (options.method !== 'GET' && csrf !== null) {
      headers.set(CSRF_HEADER, csrf)
    }
    try {
      return await fetch(new URL(path, baseUrl), {
        method: options.method,
        headers,
        body: options.body === undefined ? null : JSON.stringify(options.body),
        credentials: 'include',
        signal: options.signal ?? null,
      })
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }
      throw createNetworkError(error)
    }
  }

  async function fetchCsrfToken(): Promise<string> {
    const response = await send(CSRF_PATH, { method: 'GET' }, null)
    if (!response.ok) {
      throw await apiErrorFromResponse(response)
    }
    const token = response.headers.get(CSRF_HEADER)
    if (token === null || token === '') {
      throw new ApiError({
        status: response.status,
        type: 'ResponseParseError',
        message: 'CSRF token is missing in the response.',
      })
    }
    return token
  }

  function ensureCsrf(): Promise<string> {
    if (csrfToken !== null) {
      return Promise.resolve(csrfToken)
    }
    csrfPromise ??= fetchCsrfToken()
      .then((token) => {
        csrfToken = token
        return token
      })
      .finally(() => {
        csrfPromise = null
      })
    return csrfPromise
  }

  function expireSession(): void {
    if (expiredRefreshCycle === refreshCycle) {
      return
    }
    expiredRefreshCycle = refreshCycle
    sessionExpiredHandler?.()
  }

  async function rotateSession(): Promise<void> {
    refreshCycle += 1
    try {
      await request(ROTATE_PATH, {
        method: 'POST',
        body: { fingerprint: getFingerprint() },
        skipRefresh: true,
      })
    } catch (error) {
      expireSession()
      throw createSessionExpiredError(error)
    }
    sessionGeneration += 1
  }

  function refreshSession(): Promise<void> {
    refreshPromise ??= rotateSession().finally(() => {
      refreshPromise = null
    })
    return refreshPromise
  }

  async function execute(path: string, options: RequestOptions, retry: RetryState) {
    const csrfAtSend = await ensureCsrf()
    const generationAtSend = sessionGeneration
    const response = await send(path, options, csrfAtSend)

    if (response.status === 419 && !retry.csrfRetried) {
      if (csrfToken === csrfAtSend) {
        csrfToken = null
      }
      return execute(path, options, { ...retry, csrfRetried: true })
    }

    if (response.status === 401 && options.skipRefresh !== true) {
      if (retry.sessionRetried) {
        expireSession()
        throw createSessionExpiredError(await apiErrorFromResponse(response))
      }
      if (generationAtSend === sessionGeneration) {
        await refreshSession()
      }
      return execute(path, options, { ...retry, sessionRetried: true })
    }

    if (!response.ok) {
      throw await apiErrorFromResponse(response)
    }
    return response
  }

  async function readBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return undefined
    }
    const text = await response.text()
    if (text === '') {
      return undefined
    }
    try {
      const body: unknown = JSON.parse(text)
      return body
    } catch (error) {
      throw createResponseParseError(response.status, error)
    }
  }

  function request(path: string, options: RequestOptions): Promise<unknown>
  function request<Schema extends z.ZodType>(
    path: string,
    options: RequestOptions,
    schema: Schema,
  ): Promise<z.output<Schema>>
  async function request(
    path: string,
    options: RequestOptions,
    schema?: z.ZodType,
  ): Promise<unknown> {
    const response = await execute(path, options, { csrfRetried: false, sessionRetried: false })
    const body = await readBody(response)
    if (schema === undefined) {
      return body
    }
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      throw createResponseParseError(response.status, parsed.error)
    }
    return parsed.data
  }

  function get(path: string): Promise<unknown>
  function get<Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    options?: CallOptions,
  ): Promise<z.output<Schema>>
  function get(path: string, schema?: z.ZodType, options?: CallOptions): Promise<unknown> {
    const requestOptions: RequestOptions = { ...options, method: 'GET' }
    return schema === undefined
      ? request(path, requestOptions)
      : request(path, requestOptions, schema)
  }

  function post(path: string, body?: unknown): Promise<unknown>
  function post<Schema extends z.ZodType>(
    path: string,
    body: unknown,
    schema: Schema,
    options?: CallOptions,
  ): Promise<z.output<Schema>>
  function post(
    path: string,
    body?: unknown,
    schema?: z.ZodType,
    options?: CallOptions,
  ): Promise<unknown> {
    const requestOptions: RequestOptions = { ...options, method: 'POST', body }
    return schema === undefined
      ? request(path, requestOptions)
      : request(path, requestOptions, schema)
  }

  function put(path: string, body?: unknown): Promise<unknown>
  function put<Schema extends z.ZodType>(
    path: string,
    body: unknown,
    schema: Schema,
    options?: CallOptions,
  ): Promise<z.output<Schema>>
  function put(
    path: string,
    body?: unknown,
    schema?: z.ZodType,
    options?: CallOptions,
  ): Promise<unknown> {
    const requestOptions: RequestOptions = { ...options, method: 'PUT', body }
    return schema === undefined
      ? request(path, requestOptions)
      : request(path, requestOptions, schema)
  }

  return { request, get, post, put, setSessionExpiredHandler }
}

export type HttpClient = ReturnType<typeof createHttpClient>
