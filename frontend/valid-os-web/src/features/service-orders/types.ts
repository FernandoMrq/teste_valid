import type { ClientDto } from '../clients/types'

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export type ServiceOrderStatus =
  | 'Open'
  | 'InProgress'
  | 'AwaitingCustomer'
  | 'Resolved'
  | 'Closed'

export type ServiceOrderDto = {
  id: string
  clientId: string
  description: string
  priority: Priority
  status: ServiceOrderStatus
  createdByUserId: string
  createdAt: string
  updatedAt: string
  closedAt: string | null
}

export type ServiceOrderDetailsDto = ServiceOrderDto & {
  client: ClientDto
}

export type PagedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type ServiceOrderSummaryDto = {
  openTotal: number
  criticalOpenCount: number
  closedLast7Days: number
}
