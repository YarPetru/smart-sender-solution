import type { ReactNode } from 'react'
import { WebhooksTableHeader } from '@/features/webhooks/components/WebhooksTable'
import { WEBHOOKS_PAGE_SIZE } from '@/features/webhooks/queries'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableRow } from '@/shared/ui/table'

const SKELETON_ROWS = Array.from({ length: WEBHOOKS_PAGE_SIZE }, (_, index) => index)

export function WebhooksTableSkeleton() {
  return (
    <div className="rounded-md border" role="status" aria-label="Loading webhooks">
      <Table className="table-fixed">
        <WebhooksTableHeader />
        <TableBody>
          {SKELETON_ROWS.map((row) => (
            <TableRow key={row}>
              <TableCell>
                <Skeleton className="h-4 w-3/4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-8 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

type MessageStateProps = {
  title: string
  children?: ReactNode
}

function MessageState({ title, children }: MessageStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {children}
    </div>
  )
}

export function WebhooksEmptyState() {
  return (
    <MessageState title="No webhooks yet">
      <p className="text-sm text-muted-foreground">Webhooks you create will appear here.</p>
    </MessageState>
  )
}

export function WebhooksNoMatchesState({
  search,
  onClearSearch,
}: {
  search: string
  onClearSearch: () => void
}) {
  return (
    <MessageState title={`No webhooks match “${search}”`}>
      <Button variant="outline" size="sm" onClick={onClearSearch}>
        Clear search
      </Button>
    </MessageState>
  )
}

export function WebhooksPageOutOfRangeState({ onFirstPage }: { onFirstPage: () => void }) {
  return (
    <MessageState title="This page is empty">
      <Button variant="outline" size="sm" onClick={onFirstPage}>
        Go to page 1
      </Button>
    </MessageState>
  )
}
