import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { createClient, type CreateClientBody } from './clientsApi'

export function useCreateClientMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateClientBody) => createClient(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}
