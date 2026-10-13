export const DEFAULT_REDIRECT = '/webhooks'

export function safeRedirect(value: unknown): string {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/\\')
  ) {
    return value
  }
  return DEFAULT_REDIRECT
}
