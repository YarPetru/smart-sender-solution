import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { mockUser } from '@/mocks/db'
import {
  errorResponse,
  readJsonBody,
  toValidationPayload,
  validationErrorResponse,
} from '@/mocks/errors'
import { simulateNetworkLatency, withCsrf, withXhrWarning } from '@/mocks/guards'
import {
  consumeDeviceToken,
  createDeviceToken,
  revokeSession,
  rotateSession,
  startSession,
} from '@/mocks/session'
import {
  issueTokenRequestSchema,
  rotateTokenRequestSchema,
  type LoginResponse,
} from '@/shared/api/contract'

const FINGERPRINT_PATTERN = /^[0-9a-f]{32}$/

const loginBodySchema = z.object({
  email: z
    .string({ error: 'The email field is required.' })
    .trim()
    .min(1, 'The email field is required.')
    .pipe(z.email('The email must be a valid email address.')),
  password: z
    .string({ error: 'The password field is required.' })
    .min(1, 'The password field is required.'),
  fingerprint: z
    .string({ error: 'The fingerprint field is required.' })
    .regex(FINGERPRINT_PATTERN, 'The fingerprint format is invalid.'),
})

export const authHandlers = [
  http.post(
    '*/auth/login',
    withXhrWarning(
      withCsrf(async ({ request }) => {
        await simulateNetworkLatency()
        const captchaToken = request.headers.get('X-Captcha-Token')
        if (captchaToken === null || captchaToken === '') {
          return errorResponse(400, 'BadRequestException', 'Captcha token is missing.')
        }
        const parsed = loginBodySchema.safeParse(await readJsonBody(request))
        if (!parsed.success) {
          return validationErrorResponse(toValidationPayload(parsed.error))
        }
        const { email, password, fingerprint } = parsed.data
        if (email !== mockUser.email || password !== mockUser.password) {
          return validationErrorResponse({
            password: ['These credentials do not match our records.'],
          })
        }
        const response: LoginResponse = { device_session_token: createDeviceToken(fingerprint) }
        return HttpResponse.json(response)
      }),
    ),
  ),

  http.post(
    '*/auth/token/issue',
    withXhrWarning(
      withCsrf(async ({ request }) => {
        await simulateNetworkLatency()
        const parsed = issueTokenRequestSchema.safeParse(await readJsonBody(request))
        if (
          !parsed.success ||
          !consumeDeviceToken(parsed.data.device_session_token, parsed.data.fingerprint)
        ) {
          return validationErrorResponse({
            device_session_token: ['The device session token is invalid.'],
          })
        }
        startSession(parsed.data.fingerprint)
        return HttpResponse.json({})
      }),
    ),
  ),

  http.post(
    '*/auth/token/rotate',
    withXhrWarning(
      withCsrf(async ({ request }) => {
        await simulateNetworkLatency()
        const parsed = rotateTokenRequestSchema.safeParse(await readJsonBody(request))
        const fingerprint = parsed.success ? parsed.data.fingerprint : ''
        if (!rotateSession(fingerprint)) {
          return errorResponse(400, 'BadRequestException', 'Session cannot be rotated.')
        }
        return HttpResponse.json({})
      }),
    ),
  ),

  http.post(
    '*/auth/token/revoke',
    withXhrWarning(
      withCsrf(async () => {
        await simulateNetworkLatency()
        revokeSession()
        return new HttpResponse(null, { status: 204 })
      }),
    ),
  ),
]
