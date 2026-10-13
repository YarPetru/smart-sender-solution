import { LogOutIcon } from 'lucide-react'
import { Link, Outlet } from 'react-router'
import { useLogout, useMe } from '@/features/auth/queries'
import { Button } from '@/shared/ui/button'

export function AppShell() {
  const { data: me } = useMe()
  const logout = useLogout()

  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link to="/webhooks" className="font-semibold">
            Smart Sender
          </Link>
          <div className="flex items-center gap-3">
            {me !== undefined && <span className="text-sm text-muted-foreground">{me.name}</span>}
            <Button
              variant="outline"
              size="sm"
              disabled={logout.isPending}
              onClick={() => {
                logout.mutate()
              }}
            >
              <LogOutIcon aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
