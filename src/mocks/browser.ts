import { setupWorker, type StartOptions } from 'msw/browser'
import { handlers } from '@/mocks/handlers'

const startOptions: StartOptions = { onUnhandledRequest: 'bypass', quiet: true }

export const worker = setupWorker(...handlers)

async function reactivateWorker(): Promise<void> {
  worker.stop()
  await worker.start(startOptions)
}

export async function startMockWorker(): Promise<void> {
  await worker.start(startOptions)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void reactivateWorker()
    }
  })
}
