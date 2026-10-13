import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild variant="outline">
        <Link to="/webhooks">Go to webhooks</Link>
      </Button>
    </main>
  )
}
