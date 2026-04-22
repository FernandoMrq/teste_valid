import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useAuth } from '../../features/auth/hooks/useAuth'
import { getServiceOrdersSummary, listServiceOrders } from '../../features/service-orders/api/serviceOrdersApi'
import { listClients } from '../../features/clients/api/clientsApi'
import { queryKeys } from '../../shared/api/queryKeys'

/**
 * Aquece cache pós-login para Dashboard e listas principais.
 */
export function PostLoginPrefetch() {
  const { authenticated, initialized } = useAuth()
  const queryClient = useQueryClient()
  const didRun = useRef(false)

  useEffect(() => {
    if (!initialized || !authenticated) {
      return
    }
    if (didRun.current) {
      return
    }
    didRun.current = true

    void queryClient.prefetchQuery({
      queryKey: queryKeys.serviceOrders.summary(),
      queryFn: getServiceOrdersSummary,
    })
    void queryClient.prefetchQuery({
      queryKey: queryKeys.clients.list({
        page: 1,
        pageSize: 20,
        search: undefined,
      }),
      queryFn: () =>
        listClients({ page: 1, pageSize: 20, search: undefined }),
    })
    void queryClient.prefetchQuery({
      queryKey: queryKeys.serviceOrders.list({
        page: 1,
        pageSize: 20,
        status: undefined,
        priority: undefined,
        clientId: undefined,
      }),
      queryFn: () =>
        listServiceOrders({
          page: 1,
          pageSize: 20,
        }),
    })
  }, [authenticated, initialized, queryClient])

  return null
}
