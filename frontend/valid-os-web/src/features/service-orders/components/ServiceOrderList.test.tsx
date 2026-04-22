import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

const { useServiceOrdersQuery, useClientsQuery, useClientByIdQuery } =
  vi.hoisted(() => ({
    useServiceOrdersQuery: vi.fn(),
    useClientsQuery: vi.fn(),
    useClientByIdQuery: vi.fn(),
  }))

vi.mock('../api/useServiceOrdersQuery', () => ({ useServiceOrdersQuery }))
vi.mock('../../clients', () => ({ useClientsQuery, useClientByIdQuery }))

import { ServiceOrderList } from './ServiceOrderList'

beforeEach(() => {
  useServiceOrdersQuery.mockReset()
  useClientsQuery.mockReturnValue({ data: { items: [], total: 0 } })
  useClientByIdQuery.mockReturnValue({ data: undefined })
})

describe('ServiceOrderList', () => {
  it('shows error state', () => {
    useServiceOrdersQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('erro'),
    })
    renderWithProviders(<ServiceOrderList />)
    expect(screen.getByRole('alert')).toHaveTextContent('erro')
  })

  it('renders service orders on success', async () => {
    useServiceOrdersQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: 'so-1',
            clientId: 'c-1',
            description: 'Trocar peça',
            priority: 'High',
            status: 'Open',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    })
    renderWithProviders(<ServiceOrderList />)
    await waitFor(() =>
      expect(screen.getByText('Trocar peça')).toBeInTheDocument()
    )
    expect(screen.getByRole('link', { name: /detalhes/i })).toHaveAttribute(
      'href',
      '/service-orders/so-1/details'
    )
  })

  it('shows empty state when no orders and no filters', () => {
    useServiceOrdersQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], total: 0, page: 1, pageSize: 20 },
    })
    renderWithProviders(<ServiceOrderList />)
    expect(
      screen.getByText(/Nenhuma ordem de serviço ainda/i)
    ).toBeInTheDocument()
  })
})
