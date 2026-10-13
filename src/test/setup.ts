import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@/mocks/node'
import { __resetMockState } from '@/mocks/session'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  __resetMockState()
})

afterAll(() => {
  server.close()
})
