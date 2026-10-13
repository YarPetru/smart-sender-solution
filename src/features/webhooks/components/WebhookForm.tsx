import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useUpdateWebhook } from '@/features/webhooks/queries'
import {
  webhookFormFields,
  webhookFormSchema,
  type WebhookFormValues,
} from '@/features/webhooks/schemas'
import type { Webhook } from '@/shared/api/contract'
import { getErrorMessage, isValidationError } from '@/shared/api/errors'
import { applyServerErrors } from '@/shared/lib/apply-server-errors'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'

type WebhookFormProps = {
  webhook: Webhook
  backTo: string
}

export function WebhookForm({ webhook, backTo }: WebhookFormProps) {
  const navigate = useNavigate()
  const updateMutation = useUpdateWebhook(webhook.id)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: { name: webhook.name, url: webhook.url },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values)
      toast.success('Webhook saved')
      void navigate(backTo)
    } catch (error) {
      if (isValidationError(error)) {
        applyServerErrors(error.payload, webhookFormFields, setError)
        return
      }
      setError('root.server', { type: 'server', message: getErrorMessage(error) })
    }
  })

  const serverError = errors.root?.server?.message

  return (
    <form className="grid gap-4" noValidate onSubmit={(event) => void onSubmit(event)}>
      {serverError !== undefined && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <FormField id="name" label="Name" error={errors.name?.message}>
        {(controlProps) => <Input {...controlProps} autoComplete="off" {...register('name')} />}
      </FormField>
      <FormField id="url" label="URL" error={errors.url?.message}>
        {(controlProps) => (
          <Input {...controlProps} type="url" autoComplete="url" {...register('url')} />
        )}
      </FormField>
      <div className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link to={backTo}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
