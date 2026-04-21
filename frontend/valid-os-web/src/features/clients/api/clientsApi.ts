import { axiosClient } from '../../../shared/api/axiosClient'

import type { ClientDto, PagedResult } from '../types'

export type ListClientsParams = {
  page: number
  pageSize: number
  search?: string
}

export async function listClients(
  params: ListClientsParams
): Promise<PagedResult<ClientDto>> {
  const { data } = await axiosClient.get<PagedResult<ClientDto>>(
    '/api/clients',
    {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      },
    }
  )
  return data
}

export async function getClientById(id: string): Promise<ClientDto> {
  const { data } = await axiosClient.get<ClientDto>(`/api/clients/${id}`)
  return data
}

export type CreateClientBody = {
  name: string
  email: string
  documentValue?: string
}

export async function createClient(
  body: CreateClientBody
): Promise<ClientDto> {
  const { data } = await axiosClient.post<ClientDto>('/api/clients', body)
  return data
}
