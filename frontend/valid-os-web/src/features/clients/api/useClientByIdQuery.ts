import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { getClientById } from './clientsApi'

export function useClientByIdQuery(clientId: string | undefined) {
  return useQuery({
    queryKey:
      clientId !== undefined && clientId !== ''
        ? queryKeys.clients.detail(clientId)
        : queryKeys.clients.detail('_'),
    queryFn: () => getClientById(clientId!),
    enabled: clientId !== undefined && clientId !== '',
  })
}
