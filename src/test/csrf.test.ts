import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/node'
import { createTestClient, recordRequests, signIn } from '@/test/helpers'

function respondWithWrongCsrfToken() {
  return new HttpResponse(null, { status: 204, headers: { 'X-CSRF-TOKEN': 'stale-token' } })
}

describe('csrf', () => {
  it('refetches the token after 419 and retries the request once', async () => {
    const { client } = createTestClient()
    server.use(http.get('*/csrf', respondWithWrongCsrfToken, { once: true }))
    const requests = recordRequests()

    await signIn(client)
    requests.stop()

    expect(requests.count('GET /csrf')).toBe(2)
    expect(requests.count('POST /auth/login')).toBe(2)
    expect(requests.count('POST /auth/token/issue')).toBe(1)
  })

  it('throws when the retried request gets 419 again', async () => {
    const { client } = createTestClient()
    server.use(http.get('*/csrf', respondWithWrongCsrfToken))
    const requests = recordRequests()

    await expect(signIn(client)).rejects.toMatchObject({
      status: 419,
      type: 'TokenMismatchException',
    })
    requests.stop()

    expect(requests.count('POST /auth/login')).toBe(2)
  })

  it('shares a single csrf request between parallel first calls', async () => {
    const { client } = createTestClient()
    const requests = recordRequests()

    await Promise.allSettled([client.get('/v1/me'), client.get('/v1/webhooks'), signIn(client)])
    requests.stop()

    expect(requests.count('GET /csrf')).toBe(1)
  })
})
