import { http } from 'msw'
import { describe, expect, it } from 'vitest'
import { mockUser } from '@/mocks/db'
import { errorResponse } from '@/mocks/errors'
import { server } from '@/mocks/node'
import { __expireSession, __getRotateCalls } from '@/mocks/session'
import { meSchema, webhookListSchema, webhookSchema } from '@/shared/api/contract'
import { createGate, createTestClient, FIXED_FP, signIn } from '@/test/helpers'

describe('session refresh', () => {
  it('two parallel requests that get 401 share a single rotate and both succeed', async () => {
    const { client, onSessionExpired } = createTestClient()
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

  it('rejects all parallel requests with SessionExpired and notifies once when rotate fails', async () => {
    const { client, onSessionExpired } = createTestClient()
    await signIn(client)
    await client.post('/auth/token/revoke', { fingerprint: FIXED_FP })
    __expireSession()

    const results = await Promise.allSettled([
      client.get('/v1/me', meSchema),
      client.get('/v1/webhooks?page=1&limit=10', webhookListSchema),
    ])

    for (const result of results) {
      expect(result.status).toBe('rejected')
      if (result.status === 'rejected') {
        expect(result.reason).toMatchObject({ status: 401, type: 'SessionExpired' })
      }
    }
    expect(__getRotateCalls()).toBe(1)
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('retries a late 401 without a second rotate when a rotate already completed', async () => {
    const { client, onSessionExpired } = createTestClient()
    await signIn(client)
    __expireSession()

    const responseGate = createGate()
    server.use(
      http.get(
        '*/v1/webhooks/:id',
        async () => {
          await responseGate.opened
          return errorResponse(401, 'AuthenticationException', 'Unauthenticated.')
        },
        { once: true },
      ),
    )

    const lateRequest = client.get('/v1/webhooks/wh_01', webhookSchema)
    await client.get('/v1/me', meSchema)
    expect(__getRotateCalls()).toBe(1)

    responseGate.open()
    const webhook = await lateRequest

    expect(webhook.id).toBe('wh_01')
    expect(__getRotateCalls()).toBe(1)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})
