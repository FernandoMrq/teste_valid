import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { createServiceOrder } = vi.hoisted(() => ({
  createServiceOrder: vi.fn(),
}))

vi.mock('./serviceOrdersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./serviceOrdersApi')>()
  return { ...actual, createServiceOrder }
})

import { queryKeys } from '../../../shared/api/queryKeys'

import { useCreateServiceOrderMutation } from './useCreateServiceOrderMutation'

function makeWrapper(qc: QueryClient) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('useCreateServiceOrderMutation', () => {
  it('calls API and invalidates service orders cache on success', async () => {
    const qc = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    const invalidate = vi.spyOn(qc, 'invalidateQueries')
    createServiceOrder.mockResolvedValue({ id: '1' })

    const { result } = renderHook(() => useCreateServiceOrderMutation(), {
      wrapper: makeWrapper(qc),
    })

    await result.current.mutateAsync({
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      description: 'descrição longa',
      priority: 'Medium',
    })

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: queryKeys.serviceOrders.all,
      })
    )
    expect(createServiceOrder).toHaveBeenCalled()
  })
})
