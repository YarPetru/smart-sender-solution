import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router'
import { LoginPage } from '@/features/auth/LoginPage'
import { meQuery } from '@/features/auth/queries'
import { AppShell } from '@/features/layout/AppShell'
import { NotFoundPage } from '@/features/layout/NotFoundPage'
import { WebhookEditPage } from '@/features/webhooks/WebhookEditPage'
import { WebhooksListPage } from '@/features/webhooks/WebhooksListPage'
import { authStore, useAuthStatus } from '@/shared/auth/auth-store'
import { safeRedirect } from '@/shared/lib/safe-redirect'
import { FullPageLoader } from '@/shared/ui/full-page-loader'

function useSessionBootstrap(enabled: boolean): void {
  const { isSuccess, isError } = useQuery({ ...meQuery, enabled })

  useEffect(() => {
    if (!enabled) {
      return
    }
    if (isSuccess) {
      authStore.set('authenticated')
    } else if (isError) {
      authStore.set('anonymous')
    }
  }, [enabled, isSuccess, isError])
}

function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStatus()
  const { pathname, search } = useLocation()
  useSessionBootstrap(status === 'unknown')

  if (status === 'unknown') {
    return <FullPageLoader />
  }
  if (status === 'anonymous') {
    return <Navigate to={loginPathFor(pathname + search)} replace />
  }
  return children
}

function loginPathFor(currentPath: string): string {
  if (authStore.getSignOutReason() === 'logout') {
    return '/login'
  }
  return `/login?redirect=${encodeURIComponent(currentPath)}`
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const status = useAuthStatus()
  const [searchParams] = useSearchParams()

  if (status === 'authenticated') {
    return <Navigate to={safeRedirect(searchParams.get('redirect'))} replace />
  }
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/webhooks" replace />} />
        <Route path="webhooks" element={<WebhooksListPage />} />
        <Route path="webhooks/:id" element={<WebhookEditPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
