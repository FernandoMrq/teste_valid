import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { updateServiceOrder } = vi.hoisted(() => ({
  updateServiceOrder: vi.fn(),
}))

vi.mock('./serviceOrdersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./serviceOrdersApi')>()
  return { ...actual, updateServiceOrder }
})

import { queryKeys } from '../../../shared/api/queryKeys'

import { useUpdateServiceOrderMutation } from './useUpdateServiceOrderMutation'

function makeWrapper(qc: QueryClient) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('useUpdateServiceOrderMutation', () => {
  it('invalidates list and detail on success', async () => {
    const qc = new QueryClient()
    const invalidate = vi.spyOn(qc, 'invalidateQueries')
    updateServiceOrder.mockResolvedValue(undefined)

    const { result } = renderHook(() => useUpdateServiceOrderMutation(), {
      wrapper: makeWrapper(qc),
    })

    await result.current.mutateAsync({
      id: 'abc',
      body: { description: 'd', priority: 'Low' },
    })

    expect(updateServiceOrder).toHaveBeenCalledWith('abc', {
      description: 'd',
      priority: 'Low',
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.serviceOrders.all,
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.serviceOrders.detail('abc'),
    })
  })
})
