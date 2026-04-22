import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

const { useClientsQuery } = vi.hoisted(() => ({
  useClientsQuery: vi.fn(),
}))

vi.mock('../api/useClientsQuery', () => ({ useClientsQuery }))

import { ClientList } from './ClientList'

beforeEach(() => {
  useClientsQuery.mockReset()
})

describe('ClientList', () => {
  it('shows skeleton while loading', () => {
    useClientsQuery.mockReturnValue({ isLoading: true, isError: false })
    renderWithProviders(<ClientList />)
    expect(screen.getByText('Clientes')).toBeInTheDocument()
  })

  it('shows error message on failure', () => {
    useClientsQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('boom'),
    })
    renderWithProviders(<ClientList />)
    expect(screen.getByRole('alert')).toHaveTextContent('boom')
  })

  it('renders client rows on success', async () => {
    useClientsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: '1',
            name: 'Acme',
            email: 'a@b.com',
            documentValue: null,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    })
    renderWithProviders(<ClientList />)
    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument())
  })

  it('shows empty state when no clients and no search', () => {
    useClientsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], total: 0, page: 1, pageSize: 20 },
    })
    renderWithProviders(<ClientList />)
    expect(screen.getByText(/Nenhum cliente cadastrado/i)).toBeInTheDocument()
  })
})
