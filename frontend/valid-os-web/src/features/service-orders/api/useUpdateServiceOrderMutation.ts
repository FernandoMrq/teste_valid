import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import {
  updateServiceOrder,
  type UpdateServiceOrderBody,
} from './serviceOrdersApi'

export function useUpdateServiceOrderMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: UpdateServiceOrderBody
    }) => updateServiceOrder(id, body),
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: queryKeys.serviceOrders.all })
      await qc.invalidateQueries({
        queryKey: queryKeys.serviceOrders.detail(variables.id),
      })
    },
  })
}
