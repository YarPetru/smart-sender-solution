import { apiClient } from '@/shared/api/client'
import { loginResponseSchema, meSchema, type LoginResponse, type Me } from '@/shared/api/contract'
import { getFingerprint } from '@/shared/auth/fingerprint'

export const MOCK_CAPTCHA_TOKEN = 'mock-captcha-token'

export type Credentials = {
  email: string
  password: string
}

export function login(credentials: Credentials): Promise<LoginResponse> {
  return apiClient.post(
    '/auth/login',
    { ...credentials, fingerprint: getFingerprint() },
    loginResponseSchema,
    { skipRefresh: true, headers: { 'X-Captcha-Token': MOCK_CAPTCHA_TOKEN } },
  )
}

export async function issue(deviceSessionToken: string): Promise<void> {
  await apiClient.request('/auth/token/issue', {
    method: 'POST',
    body: { device_session_token: deviceSessionToken, fingerprint: getFingerprint() },
    skipRefresh: true,
  })
}

export async function revoke(): Promise<void> {
  await apiClient.request('/auth/token/revoke', {
    method: 'POST',
    body: { fingerprint: getFingerprint() },
    skipRefresh: true,
  })
}

export function getMe(signal?: AbortSignal): Promise<Me> {
  return apiClient.get('/v1/me', meSchema, signal === undefined ? {} : { signal })
}
