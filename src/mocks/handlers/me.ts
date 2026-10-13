import { http, HttpResponse } from 'msw'
import { mockUser, toPublicUser } from '@/mocks/db'
import { simulateNetworkLatency, withAuth, withXhrWarning } from '@/mocks/guards'

export const meHandlers = [
  http.get(
    '*/v1/me',
    withXhrWarning(
      withAuth(async () => {
        await simulateNetworkLatency()
        return HttpResponse.json(toPublicUser(mockUser))
      }),
    ),
  ),
]
