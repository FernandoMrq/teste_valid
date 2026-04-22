import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { listServiceOrders } = vi.hoisted(() => ({
  listServiceOrders: vi.fn(),
}))

vi.mock('./serviceOrdersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./serviceOrdersApi')>()
  return { ...actual, listServiceOrders }
})

import { useServiceOrdersQuery } from './useServiceOrdersQuery'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useServiceOrdersQuery', () => {
  it('returns data and forwards params to the API', async () => {
    listServiceOrders.mockResolvedValue({
      items: [{ id: '1' }],
      total: 1,
      page: 1,
      pageSize: 20,
    })

    const { result } = renderHook(
      () => useServiceOrdersQuery({ page: 1, pageSize: 20 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBe(1)
    expect(listServiceOrders).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20 })
    )
  })

  it('surfaces errors', async () => {
    listServiceOrders.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(
      () => useServiceOrdersQuery({ page: 1, pageSize: 10 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
