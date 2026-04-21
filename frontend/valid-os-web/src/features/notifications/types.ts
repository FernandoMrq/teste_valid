export type NotificationDto = {
  id: string
  serviceOrderId: string
  clientId: string
  message: string
  channel: string
  processedAt: string
}

export type PagedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}
