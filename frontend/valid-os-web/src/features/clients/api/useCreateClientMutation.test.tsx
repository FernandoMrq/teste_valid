import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }))

vi.mock('./clientsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./clientsApi')>()
  return { ...actual, createClient }
})

import { queryKeys } from '../../../shared/api/queryKeys'

import { useCreateClientMutation } from './useCreateClientMutation'

function makeWrapper(qc: QueryClient) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('useCreateClientMutation', () => {
  it('invalidates clients list on success', async () => {
    const qc = new QueryClient()
    const invalidate = vi.spyOn(qc, 'invalidateQueries')
    createClient.mockResolvedValue({ id: '1', name: 'X' })

    const { result } = renderHook(() => useCreateClientMutation(), {
      wrapper: makeWrapper(qc),
    })

    await result.current.mutateAsync({ name: 'X', email: 'x@y.com' })

    expect(createClient).toHaveBeenCalledWith({ name: 'X', email: 'x@y.com' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.clients.all })
  })
})
