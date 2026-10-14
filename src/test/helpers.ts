import { vi } from 'vitest'
import { mockUser } from '@/mocks/db'
import { server } from '@/mocks/node'
import { loginResponseSchema } from '@/shared/api/contract'
import { createHttpClient, type HttpClient } from '@/shared/api/http-client'

export const FIXED_FP = '0123456789abcdef0123456789abcdef'

export function createTestClient() {
  const onSessionExpired = vi.fn()
  const client = createHttpClient({
    baseUrl: 'http://localhost',
    getFingerprint: () => FIXED_FP,
    onSessionExpired,
  })
  return { client, onSessionExpired }
}

export async function signIn(client: HttpClient): Promise<void> {
  const { device_session_token } = await client.post(
    '/auth/login',
    { email: mockUser.email, password: mockUser.password, fingerprint: FIXED_FP },
    loginResponseSchema,
    { skipRefresh: true, headers: { 'X-Captcha-Token': 'test-captcha-token' } },
  )
  await client.request('/auth/token/issue', {
    method: 'POST',
    body: { device_session_token, fingerprint: FIXED_FP },
    skipRefresh: true,
  })
}

export function createGate() {
  let resolveOpened: (() => void) | null = null
  const opened = new Promise<void>((resolve) => {
    resolveOpened = resolve
  })
  return {
    opened,
    open: () => {
      resolveOpened?.()
    },
  }
}

export function recordRequests() {
  const requests: string[] = []
  const listener = ({ request }: { request: Request }) => {
    requests.push(`${request.method} ${new URL(request.url).pathname}`)
  }
  server.events.on('request:start', listener)
  return {
    count: (entry: string) => requests.filter((request) => request === entry).length,
    stop: () => {
      server.events.removeListener('request:start', listener)
    },
  }
}
