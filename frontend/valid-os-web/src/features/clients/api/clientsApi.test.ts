import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))

vi.mock('../../../shared/api/axiosClient', () => ({
  axiosClient: { get, post },
}))

import { createClient, getClientById, listClients } from './clientsApi'

beforeEach(() => {
  get.mockReset()
  post.mockReset()
})

describe('clientsApi', () => {
  it('listClients passes pagination and search', async () => {
    get.mockResolvedValue({ data: { items: [], total: 0, page: 1, pageSize: 10 } })

    const result = await listClients({ page: 1, pageSize: 10, search: 'ac' })

    expect(get).toHaveBeenCalledWith('/api/clients', {
      params: { page: 1, pageSize: 10, search: 'ac' },
    })
    expect(result.total).toBe(0)
  })

  it('getClientById hits detail endpoint', async () => {
    get.mockResolvedValue({ data: { id: '1', name: 'Acme' } })

    const result = await getClientById('1')

    expect(get).toHaveBeenCalledWith('/api/clients/1')
    expect(result.id).toBe('1')
  })

  it('createClient posts body', async () => {
    post.mockResolvedValue({ data: { id: '2', name: 'New' } })

    const result = await createClient({ name: 'New', email: 'n@x.com' })

    expect(post).toHaveBeenCalledWith('/api/clients', {
      name: 'New',
      email: 'n@x.com',
    })
    expect(result.id).toBe('2')
  })
})
