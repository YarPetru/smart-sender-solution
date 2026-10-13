import { resetDb } from '@/mocks/db'

export const CSRF_TOKEN = 'mock-csrf-token-0001'
export const SESSION_TTL_MS = 30_000

type MockSession = {
  fingerprint: string
  expiresAt: number
}

const deviceTokens = new Map<string, string>()
let session: MockSession | null = null
let rotateCalls = 0

function randomHex(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createDeviceToken(fingerprint: string): string {
  const token = randomHex(32)
  deviceTokens.set(token, fingerprint)
  return token
}

export function consumeDeviceToken(token: string, fingerprint: string): boolean {
  if (deviceTokens.get(token) !== fingerprint) {
    return false
  }
  deviceTokens.delete(token)
  return true
}

export function startSession(fingerprint: string): void {
  session = { fingerprint, expiresAt: Date.now() + SESSION_TTL_MS }
}

export function rotateSession(fingerprint: string): boolean {
  rotateCalls += 1
  if (session?.fingerprint !== fingerprint) {
    return false
  }
  session = { fingerprint, expiresAt: Date.now() + SESSION_TTL_MS }
  return true
}

export function revokeSession(): void {
  session = null
}

export function isSessionActive(): boolean {
  return session !== null && Date.now() < session.expiresAt
}

export function __resetMockState(): void {
  deviceTokens.clear()
  session = null
  rotateCalls = 0
  resetDb()
}

export function __expireSession(): void {
  if (session !== null) {
    session = { ...session, expiresAt: 0 }
  }
}

export function __getRotateCalls(): number {
  return rotateCalls
}
