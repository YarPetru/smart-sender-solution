const STORAGE_KEY = 'ss.fingerprint'
const FINGERPRINT_PATTERN = /^[0-9a-f]{32}$/
const FINGERPRINT_BYTES = 16

let cachedFingerprint: string | null = null

function generateFingerprint(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(FINGERPRINT_BYTES))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readStoredFingerprint(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storeFingerprint(fingerprint: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, fingerprint)
  } catch {
    return
  }
}

export function getFingerprint(): string {
  if (cachedFingerprint !== null) {
    return cachedFingerprint
  }
  const stored = readStoredFingerprint()
  if (stored !== null && FINGERPRINT_PATTERN.test(stored)) {
    cachedFingerprint = stored
    return stored
  }
  const generated = generateFingerprint()
  storeFingerprint(generated)
  cachedFingerprint = generated
  return generated
}
