import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const { listNotifications } = vi.hoisted(() => ({
  listNotifications: vi.fn(),
}))

vi.mock('./notificationsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./notificationsApi')>()
  return { ...actual, listNotifications }
})

import { useNotificationsQuery } from './useNotificationsQuery'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useNotificationsQuery', () => {
  it('fetches notifications', async () => {
    listNotifications.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    })

    const { result } = renderHook(
      () => useNotificationsQuery({ page: 1, pageSize: 10 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(listNotifications).toHaveBeenCalled()
  })
})
