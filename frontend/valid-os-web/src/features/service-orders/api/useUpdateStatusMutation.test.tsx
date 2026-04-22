import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { updateServiceOrderStatus } = vi.hoisted(() => ({
  updateServiceOrderStatus: vi.fn(),
}))

vi.mock('./serviceOrdersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./serviceOrdersApi')>()
  return { ...actual, updateServiceOrderStatus }
})

import { queryKeys } from '../../../shared/api/queryKeys'

import { useUpdateStatusMutation } from './useUpdateStatusMutation'

function makeWrapper(qc: QueryClient) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('useUpdateStatusMutation', () => {
  it('invalidates list and detail queries on success', async () => {
    const qc = new QueryClient()
    const invalidate = vi.spyOn(qc, 'invalidateQueries')
    updateServiceOrderStatus.mockResolvedValue(undefined)

    const { result } = renderHook(() => useUpdateStatusMutation(), {
      wrapper: makeWrapper(qc),
    })

    await result.current.mutateAsync({ id: 'abc', status: 'Closed' })

    expect(updateServiceOrderStatus).toHaveBeenCalledWith('abc', 'Closed')
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.serviceOrders.all,
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.serviceOrders.detail('abc'),
    })
  })
})
