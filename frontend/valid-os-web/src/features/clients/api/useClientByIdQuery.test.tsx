import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getClientById } = vi.hoisted(() => ({ getClientById: vi.fn() }))

vi.mock('./clientsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./clientsApi')>()
  return { ...actual, getClientById }
})

import { useClientByIdQuery } from './useClientByIdQuery'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => {
  getClientById.mockReset()
})

describe('useClientByIdQuery', () => {
  it('fetches client when id is provided', async () => {
    getClientById.mockResolvedValue({ id: '1', name: 'Acme' })

    const { result } = renderHook(() => useClientByIdQuery('1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getClientById).toHaveBeenCalledWith('1')
  })

  it('is disabled when id is undefined', () => {
    const { result } = renderHook(() => useClientByIdQuery(undefined), {
      wrapper,
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(getClientById).not.toHaveBeenCalled()
  })

  it('is disabled when id is empty string', () => {
    const { result } = renderHook(() => useClientByIdQuery(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})
