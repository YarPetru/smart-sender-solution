import { delay, type HttpResponseResolver, type PathParams } from 'msw'
import { errorResponse } from '@/mocks/errors'
import { CSRF_TOKEN, isSessionActive } from '@/mocks/session'

const NETWORK_LATENCY_MS = 300

type Resolver<Params extends PathParams> = HttpResponseResolver<Params>

export async function simulateNetworkLatency(): Promise<void> {
  if (typeof window !== 'undefined') {
    await delay(NETWORK_LATENCY_MS)
  }
}

export function withXhrWarning<Params extends PathParams>(
  resolver: Resolver<Params>,
): Resolver<Params> {
  return (info) => {
    if (info.request.headers.get('X-Requested-With') !== 'XMLHttpRequest') {
      console.warn(
        `[mock] ${info.request.method} ${info.request.url} is missing X-Requested-With header`,
      )
    }
    return resolver(info)
  }
}

export function withCsrf<Params extends PathParams>(resolver: Resolver<Params>): Resolver<Params> {
  return (info) => {
    if (info.request.headers.get('X-CSRF-TOKEN') !== CSRF_TOKEN) {
      return errorResponse(419, 'TokenMismatchException', 'CSRF token mismatch.')
    }
    return resolver(info)
  }
}

export function withAuth<Params extends PathParams>(resolver: Resolver<Params>): Resolver<Params> {
  return (info) => {
    if (!isSessionActive()) {
      return errorResponse(401, 'AuthenticationException', 'Unauthenticated.')
    }
    return resolver(info)
  }
}
