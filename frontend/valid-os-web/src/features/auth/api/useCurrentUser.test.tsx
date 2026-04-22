import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { fetchCurrentUser } = vi.hoisted(() => ({
  fetchCurrentUser: vi.fn(),
}))

vi.mock('./usersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./usersApi')>()
  return { ...actual, fetchCurrentUser }
})

import { useCurrentUser } from './useCurrentUser'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useCurrentUser', () => {
  it('returns current user from API', async () => {
    fetchCurrentUser.mockResolvedValue({
      id: '1',
      name: 'Ana',
      email: 'ana@example.com',
    })

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('Ana')
  })
})
