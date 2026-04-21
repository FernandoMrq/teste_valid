import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/api/queryKeys'

import { listNotifications, type ListNotificationsParams } from './notificationsApi'

export function useNotificationsQuery(params: ListNotificationsParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => listNotifications(params),
  })
}
