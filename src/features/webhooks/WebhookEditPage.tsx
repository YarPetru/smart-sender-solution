import { ArrowLeftIcon } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { z } from 'zod'
import { WebhookForm } from '@/features/webhooks/components/WebhookForm'
import { useWebhook } from '@/features/webhooks/queries'
import { isNotFound } from '@/shared/api/errors'
import { safeRedirect } from '@/shared/lib/safe-redirect'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorAlert } from '@/shared/ui/error-alert'
import { Skeleton } from '@/shared/ui/skeleton'

const backStateSchema = z.object({ from: z.string() })

function getBackTarget(state: unknown): string {
  const parsed = backStateSchema.safeParse(state)
  return safeRedirect(parsed.success ? parsed.data.from : null)
}

const createdAtFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

export function WebhookEditPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const backTo = getBackTarget(location.state)
  const webhookQuery = useWebhook(id)

  function renderContent() {
    if (webhookQuery.isError) {
      if (isNotFound(webhookQuery.error)) {
        return (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
            <p className="font-medium">Webhook not found</p>
            <Button asChild variant="outline" size="sm">
              <Link to={backTo}>Back to list</Link>
            </Button>
          </div>
        )
      }
      return (
        <ErrorAlert
          title="Could not load webhook"
          error={webhookQuery.error}
          onRetry={() => void webhookQuery.refetch()}
        />
      )
    }

    if (webhookQuery.data === undefined) {
      return (
        <Card role="status" aria-label="Loading webhook">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="ml-auto h-9 w-40" />
          </CardContent>
        </Card>
      )
    }

    const webhook = webhookQuery.data
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Edit webhook</h1>
            <Badge variant={webhook.active ? 'default' : 'secondary'}>
              {webhook.active ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {webhook.id} · created {createdAtFormat.format(new Date(webhook.created_at))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhookForm key={webhook.id} webhook={webhook} backTo={backTo} />
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="mx-auto grid max-w-2xl gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to={backTo}>
          <ArrowLeftIcon aria-hidden="true" />
          Back to list
        </Link>
      </Button>
      {renderContent()}
    </section>
  )
}
