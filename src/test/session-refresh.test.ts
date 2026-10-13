import { describe, expect, it, vi } from 'vitest'
import { mockUser } from '@/mocks/db'
import { __expireSession, __getRotateCalls } from '@/mocks/session'
import { loginResponseSchema, meSchema, webhookListSchema } from '@/shared/api/contract'
import { createHttpClient, type HttpClient } from '@/shared/api/http-client'

const FIXED_FP = '0123456789abcdef0123456789abcdef'

async function signIn(client: HttpClient): Promise<void> {
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

describe('session refresh', () => {
  it('two parallel requests that get 401 share a single rotate and both succeed', async () => {
    const onSessionExpired = vi.fn()
    const client = createHttpClient({
      baseUrl: 'http://localhost',
      getFingerprint: () => FIXED_FP,
      onSessionExpired,
    })
    await signIn(client)
    __expireSession()

    const [me, list] = await Promise.all([
      client.get('/v1/me', meSchema),
      client.get('/v1/webhooks?page=1&limit=10', webhookListSchema),
    ])

    expect(me.email).toBe(mockUser.email)
    expect(list.data).toHaveLength(10)
    expect(list.paging.results.total).toBe(27)
    expect(__getRotateCalls()).toBe(1)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})
