import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { WebhookList } from '@/shared/api/contract'
import { Button } from '@/shared/ui/button'
import { Pagination, PaginationContent, PaginationItem } from '@/shared/ui/pagination'

type WebhooksPaginationProps = {
  paging: WebhookList['paging']
  shownCount: number
  disabled: boolean
  onPageChange: (page: number) => void
}

export function WebhooksPagination({
  paging,
  shownCount,
  disabled,
  onPageChange,
}: WebhooksPaginationProps) {
  const { current, last } = paging.pages
  const { total, limitation } = paging.results
  const firstShown = (current - 1) * limitation + 1
  const lastShown = firstShown + shownCount - 1

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
      <p aria-live="polite">
        Showing {firstShown}–{lastShown} of {total}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || current <= 1}
              onClick={() => {
                onPageChange(current - 1)
              }}
            >
              <ChevronLeftIcon aria-hidden="true" />
              Prev
            </Button>
          </PaginationItem>
          <PaginationItem className="px-2 text-foreground">
            Page {current} of {last}
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || current >= last}
              onClick={() => {
                onPageChange(current + 1)
              }}
            >
              Next
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
