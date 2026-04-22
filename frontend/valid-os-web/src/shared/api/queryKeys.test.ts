import { describe, expect, it } from 'vitest'

import { queryKeys } from './queryKeys'

describe('queryKeys', () => {
  it('builds stable keys for auth', () => {
    expect(queryKeys.auth.currentUser).toEqual(['auth', 'currentUser'])
  })

  it('builds client keys', () => {
    expect(queryKeys.clients.all).toEqual(['clients'])
    expect(queryKeys.clients.list({ page: 1, pageSize: 10 })).toEqual([
      'clients',
      'list',
      { page: 1, pageSize: 10 },
    ])
    expect(queryKeys.clients.detail('abc')).toEqual([
      'clients',
      'detail',
      'abc',
    ])
  })

  it('builds service order keys', () => {
    expect(queryKeys.serviceOrders.all).toEqual(['serviceOrders'])
    expect(queryKeys.serviceOrders.summary()).toEqual([
      'serviceOrders',
      'summary',
    ])
    expect(
      queryKeys.serviceOrders.list({ page: 2, pageSize: 5, status: 'Open' })
    ).toEqual([
      'serviceOrders',
      'list',
      { page: 2, pageSize: 5, status: 'Open' },
    ])
    expect(queryKeys.serviceOrders.detail('id-1')).toEqual([
      'serviceOrders',
      'detail',
      'id-1',
    ])
  })

  it('builds notification keys', () => {
    expect(queryKeys.notifications.all).toEqual(['notifications'])
    expect(queryKeys.notifications.list({ page: 1, pageSize: 20 })).toEqual([
      'notifications',
      'list',
      { page: 1, pageSize: 20 },
    ])
  })
})
