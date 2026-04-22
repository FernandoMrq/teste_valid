import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { getServiceOrderById } = vi.hoisted(() => ({
  getServiceOrderById: vi.fn(),
}))

vi.mock('./serviceOrdersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./serviceOrdersApi')>()
  return { ...actual, getServiceOrderById }
})

import { useServiceOrderQuery } from './useServiceOrderQuery'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useServiceOrderQuery', () => {
  it('fetches when id is provided', async () => {
    getServiceOrderById.mockResolvedValue({ id: 'so-1' })

    const { result } = renderHook(() => useServiceOrderQuery('so-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getServiceOrderById).toHaveBeenCalledWith('so-1')
  })

  it('is disabled for undefined and empty id', () => {
    const { result: r1 } = renderHook(() => useServiceOrderQuery(undefined), { wrapper })
    const { result: r2 } = renderHook(() => useServiceOrderQuery(''), { wrapper })
    expect(r1.current.fetchStatus).toBe('idle')
    expect(r2.current.fetchStatus).toBe('idle')
  })
})
