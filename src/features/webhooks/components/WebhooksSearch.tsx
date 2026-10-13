import { SearchIcon } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { Input } from '@/shared/ui/input'

const SEARCH_DEBOUNCE_MS = 300

type WebhooksSearchProps = {
  value: string
  onSearchChange: (search: string) => void
}

export function WebhooksSearch({ value, onSearchChange }: WebhooksSearchProps) {
  const [input, setInput] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)
  const debouncedInput = useDebouncedValue(input, SEARCH_DEBOUNCE_MS)

  if (value !== syncedValue) {
    setSyncedValue(value)
    if (value !== input.trim()) {
      setInput(value)
    }
  }

  const emitSearch = useEffectEvent((search: string) => {
    onSearchChange(search)
  })

  useEffect(() => {
    emitSearch(debouncedInput)
  }, [debouncedInput])

  return (
    <div className="relative w-full sm:w-72">
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label="Search webhooks by name"
        placeholder="Search by name…"
        className="pl-9"
        value={input}
        onChange={(event) => {
          setInput(event.target.value)
        }}
      />
    </div>
  )
}
