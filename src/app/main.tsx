import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/app/index.css'
import { wireSessionExpiry } from '@/app/session-expiry'

async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') {
    return
  }
  const { startMockWorker } = await import('@/mocks/browser')
  await startMockWorker()
}

function renderApp(): void {
  const rootElement = document.getElementById('root')
  if (rootElement === null) {
    throw new Error('Root element #root not found')
  }
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

await enableMocking()
wireSessionExpiry()
renderApp()
