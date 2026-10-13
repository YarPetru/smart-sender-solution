import { useSearchParams } from 'react-router'
import { z } from 'zod'

const listParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z.string().trim().catch(''),
})

type ListParams = z.infer<typeof listParamsSchema>

function toSearchParams({ page, search }: ListParams): URLSearchParams {
  const params = new URLSearchParams()
  if (page > 1) {
    params.set('page', String(page))
  }
  if (search !== '') {
    params.set('search', search)
  }
  return params
}

export function useWebhookListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, search } = listParamsSchema.parse({
    page: searchParams.get('page') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  })

  function setPage(nextPage: number): void {
    if (nextPage === page) {
      return
    }
    setSearchParams(toSearchParams({ page: nextPage, search }))
  }

  function setSearch(nextSearch: string): void {
    const trimmed = nextSearch.trim()
    if (trimmed === search) {
      return
    }
    setSearchParams(toSearchParams({ page: 1, search: trimmed }))
  }

  return { page, search, setPage, setSearch }
}
