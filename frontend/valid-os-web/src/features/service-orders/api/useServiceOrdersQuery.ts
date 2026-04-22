import { useQuery } from '@tanstack/react-query'

import { serviceOrdersQueryOptions } from './serviceOrdersQueryOptions'
import type { ListServiceOrdersParams } from './serviceOrdersApi'

export function useServiceOrdersQuery(params: ListServiceOrdersParams) {
  return useQuery(serviceOrdersQueryOptions(params))
}
