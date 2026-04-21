import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { getServiceOrderById } from './serviceOrdersApi'

export function useServiceOrderQuery(serviceOrderId: string | undefined) {
  return useQuery({
    queryKey:
      serviceOrderId !== undefined && serviceOrderId !== ''
        ? queryKeys.serviceOrders.detail(serviceOrderId)
        : queryKeys.serviceOrders.detail('_'),
    queryFn: () => getServiceOrderById(serviceOrderId!),
    enabled: serviceOrderId !== undefined && serviceOrderId !== '',
  })
}
