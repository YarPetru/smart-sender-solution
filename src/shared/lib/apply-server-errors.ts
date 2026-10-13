import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ValidationPayload } from '@/shared/api/contract'

export function applyServerErrors<Values extends FieldValues>(
  payload: ValidationPayload,
  knownFields: readonly Path<Values>[],
  setError: UseFormSetError<Values>,
): void {
  const unknownFieldMessages: string[] = []
  let hasFocusedField = false

  for (const [key, messages] of Object.entries(payload)) {
    const message = messages[0] ?? 'The value is invalid.'
    const field = knownFields.find((knownField) => knownField === key)
    if (field === undefined) {
      unknownFieldMessages.push(message)
      continue
    }
    setError(field, { type: 'server', message }, { shouldFocus: !hasFocusedField })
    hasFocusedField = true
  }

  if (unknownFieldMessages.length > 0) {
    setError('root.server', { type: 'server', message: unknownFieldMessages.join(' ') })
  }
}
