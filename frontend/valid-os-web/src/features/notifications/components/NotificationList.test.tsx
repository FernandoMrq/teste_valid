import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

const { useNotificationsQuery } = vi.hoisted(() => ({
  useNotificationsQuery: vi.fn(),
}))

vi.mock('../api/useNotificationsQuery', () => ({ useNotificationsQuery }))

import { NotificationList } from './NotificationList'

beforeEach(() => {
  useNotificationsQuery.mockReset()
})

describe('NotificationList', () => {
  it('shows error message on failure', () => {
    useNotificationsQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('falhou'),
    })
    renderWithProviders(<NotificationList />)
    expect(screen.getByRole('alert')).toHaveTextContent('falhou')
  })

  it('renders items on success', async () => {
    useNotificationsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: 'n1',
            serviceOrderId: 'so-123',
            clientId: 'cl-456',
            message: 'Ordem encerrada',
            channel: 'email',
            processedAt: '2026-01-01T12:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    })
    renderWithProviders(<NotificationList />)
    await waitFor(() =>
      expect(screen.getByText('Ordem encerrada')).toBeInTheDocument()
    )
    expect(screen.getByText('email')).toBeInTheDocument()
  })

  it('shows empty state when list is empty', () => {
    useNotificationsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], total: 0, page: 1, pageSize: 20 },
    })
    renderWithProviders(<NotificationList />)
    expect(screen.getByText(/Nenhum evento processado/i)).toBeInTheDocument()
  })
})
