import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { listClients, type ListClientsParams } from './clientsApi'

export function useClientsQuery(params: ListClientsParams) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => listClients(params),
  })
}
