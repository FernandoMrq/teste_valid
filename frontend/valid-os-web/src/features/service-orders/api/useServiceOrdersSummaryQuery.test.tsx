import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { getServiceOrdersSummary } = vi.hoisted(() => ({
  getServiceOrdersSummary: vi.fn(),
}))

vi.mock('./serviceOrdersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./serviceOrdersApi')>()
  return { ...actual, getServiceOrdersSummary }
})

import { useServiceOrdersSummaryQuery } from './useServiceOrdersSummaryQuery'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useServiceOrdersSummaryQuery', () => {
  it('fetches summary', async () => {
    getServiceOrdersSummary.mockResolvedValue({ open: 2 })

    const { result } = renderHook(() => useServiceOrdersSummaryQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ open: 2 })
  })
})
