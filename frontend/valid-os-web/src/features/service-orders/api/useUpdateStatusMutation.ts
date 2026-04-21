import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import type { ServiceOrderStatus } from '../types'

import { updateServiceOrderStatus } from './serviceOrdersApi'

export function useUpdateStatusMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: ServiceOrderStatus
    }) => updateServiceOrderStatus(id, status),
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: queryKeys.serviceOrders.all })
      await qc.invalidateQueries({
        queryKey: queryKeys.serviceOrders.detail(variables.id),
      })
    },
  })
}
