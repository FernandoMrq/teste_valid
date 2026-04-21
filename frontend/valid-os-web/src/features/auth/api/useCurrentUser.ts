import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { fetchCurrentUser } from './usersApi'

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
  })
}
