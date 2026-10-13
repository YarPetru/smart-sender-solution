import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'

type FormFieldControlProps = {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

type FormFieldProps = {
  id: string
  label: string
  error?: string | undefined
  className?: string
  children: (controlProps: FormFieldControlProps) => ReactNode
}

function FormField({ id, label, error, className, children }: FormFieldProps) {
  const errorId = `${id}-error`
  const hasError = error !== undefined && error !== ''

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        'aria-invalid': hasError,
        'aria-describedby': hasError ? errorId : undefined,
      })}
      {hasError && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export { FormField, type FormFieldControlProps }
