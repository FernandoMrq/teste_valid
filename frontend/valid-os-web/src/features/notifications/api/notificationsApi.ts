import { axiosClient } from '../../../shared/api/axiosClient'

import type { NotificationDto, PagedResult } from '../types'

export type ListNotificationsParams = {
  page: number
  pageSize: number
}

export async function listNotifications(
  params: ListNotificationsParams
): Promise<PagedResult<NotificationDto>> {
  const { data } = await axiosClient.get<PagedResult<NotificationDto>>(
    '/api/notifications',
    {
      params: {
        page: params.page,
        pageSize: params.pageSize,
      },
    }
  )
  return data
}
