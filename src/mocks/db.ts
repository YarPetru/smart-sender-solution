import type { Me, UpdateWebhookRequest, Webhook } from '@/shared/api/contract'

type MockUser = Me & { password: string }

export const mockUser: MockUser = {
  id: 'usr_1',
  email: 'demo@smartsender.com',
  password: 'passme123',
  first_name: 'Demo',
  last_name: 'User',
  name: 'Demo User',
}

export function toPublicUser({ id, email, first_name, last_name, name }: MockUser): Me {
  return { id, email, first_name, last_name, name }
}

const seedEntries: readonly (readonly [name: string, active: boolean])[] = [
  ['Order created', true],
  ['Order paid', true],
  ['Order shipped', true],
  ['Order cancelled', false],
  ['Order refunded', true],
  ['Payment succeeded', true],
  ['Payment failed', true],
  ['Payment refunded', false],
  ['Subscriber joined', true],
  ['Subscriber left', true],
  ['Subscriber tag added', true],
  ['Subscriber unsubscribed', false],
  ['Bot flow started', true],
  ['Bot flow completed', true],
  ['Bot flow failed', false],
  ['Message delivered', true],
  ['Message read', true],
  ['Message failed', true],
  ['Campaign sent', false],
  ['Campaign completed', true],
  ['Invoice created', true],
  ['Invoice overdue', false],
  ['Cart abandoned', true],
  ['Contact updated', true],
  ['Lead captured', true],
  ['Chat assigned to operator', false],
  ['Daily report ready', true],
]

const SEED_START_MS = Date.UTC(2025, 0, 6, 9, 0, 0)
const DAY_MS = 24 * 60 * 60 * 1000

function toSlug(name: string): string {
  return name.toLowerCase().replaceAll(' ', '-')
}

const seedWebhooks: readonly Webhook[] = seedEntries.map(([name, active], index) => ({
  id: `wh_${String(index + 1).padStart(2, '0')}`,
  name,
  url: `https://hooks.example.com/${toSlug(name)}`,
  active,
  created_at: new Date(SEED_START_MS + index * 3 * DAY_MS).toISOString(),
}))

let webhooks: Webhook[] = seedWebhooks.map((webhook) => ({ ...webhook }))

export function getAllWebhooks(): readonly Webhook[] {
  return webhooks
}

export function findWebhook(id: string): Webhook | undefined {
  return webhooks.find((webhook) => webhook.id === id)
}

export function updateWebhook(id: string, changes: UpdateWebhookRequest): Webhook | undefined {
  const existing = findWebhook(id)
  if (existing === undefined) {
    return undefined
  }
  const updated: Webhook = { ...existing, name: changes.name, url: changes.url }
  webhooks = webhooks.map((webhook) => (webhook.id === id ? updated : webhook))
  return updated
}

export function resetDb(): void {
  webhooks = seedWebhooks.map((webhook) => ({ ...webhook }))
}
