import { AlertCircleIcon, RotateCwIcon } from 'lucide-react'
import { getErrorMessage } from '@/shared/api/errors'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

type ErrorAlertProps = {
  title: string
  error: unknown
  onRetry?: () => void
}

function ErrorAlert({ title, error, onRetry }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{getErrorMessage(error)}</p>
        {onRetry !== undefined && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            <RotateCwIcon aria-hidden="true" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export { ErrorAlert }
