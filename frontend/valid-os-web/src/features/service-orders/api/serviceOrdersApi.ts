import { axiosClient } from '../../../shared/api/axiosClient'

import type {
  Priority,
  PagedResult,
  ServiceOrderDetailsDto,
  ServiceOrderDto,
  ServiceOrderStatus,
} from '../types'

export type ListServiceOrdersParams = {
  page: number
  pageSize: number
  status?: ServiceOrderStatus
  priority?: Priority
  clientId?: string
}

export async function listServiceOrders(
  params: ListServiceOrdersParams
): Promise<PagedResult<ServiceOrderDto>> {
  const { data } = await axiosClient.get<PagedResult<ServiceOrderDto>>(
    '/api/service-orders',
    {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        priority: params.priority,
        clientId: params.clientId,
      },
    }
  )
  return data
}

export async function getServiceOrderById(
  id: string
): Promise<ServiceOrderDetailsDto> {
  const { data } = await axiosClient.get<ServiceOrderDetailsDto>(
    `/api/service-orders/${id}`
  )
  return data
}

export type CreateServiceOrderBody = {
  clientId: string
  description: string
  priority: Priority
}

export async function createServiceOrder(
  body: CreateServiceOrderBody
): Promise<ServiceOrderDto> {
  const { data } = await axiosClient.post<ServiceOrderDto>(
    '/api/service-orders',
    body
  )
  return data
}

export type UpdateServiceOrderBody = {
  description: string
  priority: Priority
}

export async function updateServiceOrder(
  id: string,
  body: UpdateServiceOrderBody
): Promise<void> {
  await axiosClient.put(`/api/service-orders/${id}`, body)
}

export async function updateServiceOrderStatus(
  id: string,
  status: ServiceOrderStatus
): Promise<void> {
  await axiosClient.patch(`/api/service-orders/${id}/status`, { status })
}
