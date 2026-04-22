import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../../../shared/api/axiosClient', () => ({
  axiosClient: { get },
}))

import { listNotifications } from './notificationsApi'

beforeEach(() => {
  get.mockReset()
})

describe('notificationsApi', () => {
  it('listNotifications forwards pagination', async () => {
    get.mockResolvedValue({ data: { items: [], total: 0, page: 1, pageSize: 10 } })

    await listNotifications({ page: 2, pageSize: 20 })

    expect(get).toHaveBeenCalledWith('/api/notifications', {
      params: { page: 2, pageSize: 20 },
    })
  })
})
