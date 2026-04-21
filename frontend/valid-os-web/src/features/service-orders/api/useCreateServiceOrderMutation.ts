import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import {
  createServiceOrder,
  type CreateServiceOrderBody,
} from './serviceOrdersApi'

export function useCreateServiceOrderMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateServiceOrderBody) => createServiceOrder(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.serviceOrders.all })
    },
  })
}
