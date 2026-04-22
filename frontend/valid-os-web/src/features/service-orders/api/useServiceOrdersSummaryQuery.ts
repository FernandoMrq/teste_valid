import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { getServiceOrdersSummary } from './serviceOrdersApi'

export function useServiceOrdersSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.serviceOrders.summary(),
    queryFn: () => getServiceOrdersSummary(),
  })
}
