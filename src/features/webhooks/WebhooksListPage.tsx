import { WebhooksPagination } from '@/features/webhooks/components/WebhooksPagination'
import { WebhooksSearch } from '@/features/webhooks/components/WebhooksSearch'
import { WebhooksTable } from '@/features/webhooks/components/WebhooksTable'
import {
  WebhooksEmptyState,
  WebhooksNoMatchesState,
  WebhooksPageOutOfRangeState,
  WebhooksTableSkeleton,
} from '@/features/webhooks/components/WebhooksListStates'
import { useWebhooks } from '@/features/webhooks/queries'
import { useWebhookListParams } from '@/features/webhooks/use-webhook-list-params'
import { ErrorAlert } from '@/shared/ui/error-alert'

export function WebhooksListPage() {
  const { page, search, setPage, setSearch } = useWebhookListParams()
  const webhooksQuery = useWebhooks({ page, search })

  function renderContent() {
    if (webhooksQuery.isError) {
      return (
        <ErrorAlert
          title="Could not load webhooks"
          error={webhooksQuery.error}
          onRetry={() => void webhooksQuery.refetch()}
        />
      )
    }
    if (webhooksQuery.data === undefined) {
      return <WebhooksTableSkeleton />
    }

    const { data: webhooks, paging } = webhooksQuery.data
    if (webhooks.length === 0) {
      if (page > 1) {
        return (
          <WebhooksPageOutOfRangeState
            onFirstPage={() => {
              setPage(1)
            }}
          />
        )
      }
      if (search !== '') {
        return (
          <WebhooksNoMatchesState
            search={search}
            onClearSearch={() => {
              setSearch('')
            }}
          />
        )
      }
      return <WebhooksEmptyState />
    }

    return (
      <div className="grid gap-4">
        <WebhooksTable webhooks={webhooks} isStale={webhooksQuery.isPlaceholderData} />
        <WebhooksPagination
          paging={paging}
          shownCount={webhooks.length}
          disabled={webhooksQuery.isPlaceholderData}
          onPageChange={setPage}
        />
      </div>
    )
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Webhooks</h1>
        <WebhooksSearch value={search} onSearchChange={setSearch} />
      </div>
      {renderContent()}
    </section>
  )
}
