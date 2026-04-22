import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { listClients } = vi.hoisted(() => ({ listClients: vi.fn() }))

vi.mock('./clientsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./clientsApi')>()
  return { ...actual, listClients }
})

import { useClientsQuery } from './useClientsQuery'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useClientsQuery', () => {
  it('fetches clients via API', async () => {
    listClients.mockResolvedValue({
      items: [{ id: '1', name: 'Acme' }],
      total: 1,
      page: 1,
      pageSize: 10,
    })

    const { result } = renderHook(
      () => useClientsQuery({ page: 1, pageSize: 10 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(1)
    expect(listClients).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
  })
})
