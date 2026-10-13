import { http, HttpResponse } from 'msw'
import { withXhrWarning } from '@/mocks/guards'
import { CSRF_TOKEN } from '@/mocks/session'

export const csrfHandlers = [
  http.get(
    '*/csrf',
    withXhrWarning(
      () => new HttpResponse(null, { status: 204, headers: { 'X-CSRF-TOKEN': CSRF_TOKEN } }),
    ),
  ),
]
