import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { loginFormFields, loginSchema, type LoginFormValues } from '@/features/auth/login-schema'
import { useLogin } from '@/features/auth/queries'
import { getErrorMessage, isValidationError } from '@/shared/api/errors'
import { applyServerErrors } from '@/shared/lib/apply-server-errors'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'

export function LoginPage() {
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)
    } catch (error) {
      if (isValidationError(error)) {
        applyServerErrors(error.payload, loginFormFields, setError)
        return
      }
      setError('root.server', { type: 'server', message: getErrorMessage(error) })
    }
  })

  const isPending = isSubmitting || loginMutation.isPending
  const serverError = errors.root?.server?.message

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>Sign in</h1>
          </CardTitle>
          <CardDescription>Smart Sender webhooks console</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" noValidate onSubmit={(event) => void onSubmit(event)}>
            {serverError !== undefined && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <FormField id="email" label="Email" error={errors.email?.message}>
              {(controlProps) => (
                <Input {...controlProps} type="email" autoComplete="email" {...register('email')} />
              )}
            </FormField>
            <FormField id="password" label="Password" error={errors.password?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
              )}
            </FormField>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" aria-hidden="true" />}
              {isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
