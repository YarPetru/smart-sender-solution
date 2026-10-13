import { z } from 'zod'

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const webhookFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  url: z
    .string()
    .trim()
    .min(1, 'URL is required.')
    .refine(isHttpUrl, 'Enter a valid URL starting with http:// or https://.'),
})

export type WebhookFormValues = z.infer<typeof webhookFormSchema>

export const webhookFormFields = ['name', 'url'] as const
