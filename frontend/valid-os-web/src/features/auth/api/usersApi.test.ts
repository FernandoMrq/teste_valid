import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../../../shared/api/axiosClient', () => ({
  axiosClient: { get },
}))

import { fetchCurrentUser } from './usersApi'

beforeEach(() => {
  get.mockReset()
})

describe('usersApi', () => {
  it('fetchCurrentUser calls /api/users/me', async () => {
    get.mockResolvedValue({ data: { id: '1', name: 'Me' } })
    const user = await fetchCurrentUser()
    expect(get).toHaveBeenCalledWith('/api/users/me')
    expect(user.id).toBe('1')
  })
})
