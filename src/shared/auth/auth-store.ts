import { useSyncExternalStore } from 'react'

export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous'

export type SignOutReason = 'logout' | 'expired'

type Listener = () => void

let status: AuthStatus = 'unknown'
let signOutReason: SignOutReason | null = null
const listeners = new Set<Listener>()

function setStatus(next: AuthStatus): void {
  if (next === status) {
    return
  }
  status = next
  listeners.forEach((listener) => {
    listener()
  })
}

export const authStore = {
  getStatus: (): AuthStatus => status,
  getSignOutReason: (): SignOutReason | null => signOutReason,
  set: (next: AuthStatus): void => {
    if (next === 'authenticated') {
      signOutReason = null
    }
    setStatus(next)
  },
  signOut: (reason: SignOutReason): void => {
    signOutReason = reason
    setStatus('anonymous')
  },
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export function useAuthStatus(): AuthStatus {
  return useSyncExternalStore(authStore.subscribe, authStore.getStatus)
}
