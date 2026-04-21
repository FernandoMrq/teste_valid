import { useQuery } from '@tanstack/react-query'

import { fetchCurrentUser } from './usersApi'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'currentUser'] as const,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
  })
}
