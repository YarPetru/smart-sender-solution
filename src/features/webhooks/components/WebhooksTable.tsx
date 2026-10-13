import { PencilIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import type { Webhook } from '@/shared/api/contract'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

type WebhooksTableProps = {
  webhooks: readonly Webhook[]
  isStale: boolean
}

export function WebhooksTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead scope="col">Name</TableHead>
        <TableHead scope="col">URL</TableHead>
        <TableHead scope="col">Status</TableHead>
        <TableHead scope="col" className="text-right">
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

export function WebhooksTable({ webhooks, isStale }: WebhooksTableProps) {
  const { pathname, search } = useLocation()
  const from = pathname + search

  return (
    <div
      className={cn('rounded-md border transition-opacity', isStale && 'opacity-60')}
      aria-busy={isStale}
    >
      <Table className="table-fixed">
        <WebhooksTableHeader />
        <TableBody>
          {webhooks.map((webhook) => (
            <TableRow key={webhook.id}>
              <TableCell className="truncate font-medium" title={webhook.name}>
                {webhook.name}
              </TableCell>
              <TableCell className="truncate text-muted-foreground" title={webhook.url}>
                {webhook.url}
              </TableCell>
              <TableCell>
                <Badge variant={webhook.active ? 'default' : 'secondary'}>
                  {webhook.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link
                    to={`/webhooks/${webhook.id}`}
                    state={{ from }}
                    aria-label={`Edit ${webhook.name}`}
                  >
                    <PencilIcon aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
