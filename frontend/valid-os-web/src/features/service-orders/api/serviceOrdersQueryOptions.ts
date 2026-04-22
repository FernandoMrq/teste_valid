import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { listServiceOrders, type ListServiceOrdersParams } from './serviceOrdersApi'

export function serviceOrdersQueryOptions(params: ListServiceOrdersParams) {
  return queryOptions({
    queryKey: queryKeys.serviceOrders.list(params),
    queryFn: () => listServiceOrders(params),
  })
}
