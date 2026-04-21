import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import {
  listServiceOrders,
  type ListServiceOrdersParams,
} from './serviceOrdersApi'

export function useServiceOrdersQuery(params: ListServiceOrdersParams) {
  return useQuery({
    queryKey: queryKeys.serviceOrders.list(params),
    queryFn: () => listServiceOrders(params),
  })
}
