import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, issue, login, revoke, type Credentials } from '@/features/auth/api'
import { authStore } from '@/shared/auth/auth-store'

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: ({ signal }) => getMe(signal),
  staleTime: Infinity,
  retry: false,
})

export function useMe() {
  return useQuery(meQuery)
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: Credentials): Promise<void> => {
      const { device_session_token } = await login(credentials)
      await issue(device_session_token)
      const me = await getMe()
      queryClient.setQueryData(meQuery.queryKey, me)
      authStore.set('authenticated')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => revoke().catch(() => undefined),
    onSettled: () => {
      authStore.signOut('logout')
      queryClient.clear()
    },
  })
}
