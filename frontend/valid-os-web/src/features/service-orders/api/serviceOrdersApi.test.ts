import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post, put, patch } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('../../../shared/api/axiosClient', () => ({
  axiosClient: { get, post, put, patch },
}))

import {
  createServiceOrder,
  getServiceOrderById,
  getServiceOrdersSummary,
  listServiceOrders,
  updateServiceOrder,
  updateServiceOrderStatus,
} from './serviceOrdersApi'

beforeEach(() => {
  get.mockReset()
  post.mockReset()
  put.mockReset()
  patch.mockReset()
})

describe('serviceOrdersApi', () => {
  it('listServiceOrders passes filters', async () => {
    get.mockResolvedValue({ data: { items: [], total: 0, page: 1, pageSize: 10 } })

    await listServiceOrders({
      page: 1,
      pageSize: 10,
      status: 'Open',
      priority: 'High',
      clientId: 'c1',
    })

    expect(get).toHaveBeenCalledWith('/api/service-orders', {
      params: {
        page: 1,
        pageSize: 10,
        status: 'Open',
        priority: 'High',
        clientId: 'c1',
      },
    })
  })

  it('getServiceOrdersSummary calls summary endpoint', async () => {
    get.mockResolvedValue({ data: { open: 1 } })
    const result = await getServiceOrdersSummary()
    expect(get).toHaveBeenCalledWith('/api/service-orders/summary')
    expect(result).toEqual({ open: 1 })
  })

  it('getServiceOrderById calls detail endpoint', async () => {
    get.mockResolvedValue({ data: { id: 'x' } })
    const result = await getServiceOrderById('x')
    expect(get).toHaveBeenCalledWith('/api/service-orders/x')
    expect(result.id).toBe('x')
  })

  it('createServiceOrder posts body', async () => {
    post.mockResolvedValue({ data: { id: 'new' } })
    const result = await createServiceOrder({
      clientId: 'c',
      description: 'd',
      priority: 'Low',
    })
    expect(post).toHaveBeenCalledWith('/api/service-orders', {
      clientId: 'c',
      description: 'd',
      priority: 'Low',
    })
    expect(result.id).toBe('new')
  })

  it('updateServiceOrder puts body', async () => {
    put.mockResolvedValue({ data: undefined })
    await updateServiceOrder('id1', { description: 'd2', priority: 'Medium' })
    expect(put).toHaveBeenCalledWith('/api/service-orders/id1', {
      description: 'd2',
      priority: 'Medium',
    })
  })

  it('updateServiceOrderStatus patches status', async () => {
    patch.mockResolvedValue({ data: undefined })
    await updateServiceOrderStatus('id1', 'Closed')
    expect(patch).toHaveBeenCalledWith('/api/service-orders/id1/status', {
      status: 'Closed',
    })
  })
})
