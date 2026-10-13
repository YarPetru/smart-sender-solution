import { BrowserRouter } from 'react-router'
import { Providers } from '@/app/providers'
import { AppRoutes } from '@/app/routes'

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  )
}
