import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

const { useServiceOrderQuery, useClientsQuery, useClientByIdQuery } = vi.hoisted(
  () => ({
    useServiceOrderQuery: vi.fn(),
    useClientsQuery: vi.fn(),
    useClientByIdQuery: vi.fn(),
  })
)
const { useParams } = vi.hoisted(() => ({ useParams: vi.fn() }))

vi.mock('../api/useServiceOrderQuery', () => ({ useServiceOrderQuery }))
vi.mock('../../clients', () => ({ useClientsQuery, useClientByIdQuery }))
vi.mock('../api/useCreateServiceOrderMutation', () => ({
  useCreateServiceOrderMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))
vi.mock('../api/useUpdateServiceOrderMutation', () => ({
  useUpdateServiceOrderMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))
vi.mock('../api/useUpdateStatusMutation', () => ({
  useUpdateStatusMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useParams, useNavigate: () => vi.fn() }
})

import { ServiceOrderForm } from './ServiceOrderForm'

beforeEach(() => {
  useServiceOrderQuery.mockReset()
  useClientsQuery.mockReturnValue({ data: { items: [], total: 0 } })
  useClientByIdQuery.mockReturnValue({ data: undefined })
  useParams.mockReset()
})

describe('ServiceOrderForm', () => {
  it('renders the create view when no id is present', () => {
    useParams.mockReturnValue({})
    renderWithProviders(<ServiceOrderForm />)
    expect(screen.getByText('Nova ordem de serviço')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('shows loading when editing', () => {
    useParams.mockReturnValue({ id: 'so-1' })
    useServiceOrderQuery.mockReturnValue({ isLoading: true, isError: false })
    renderWithProviders(<ServiceOrderForm />)
    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })

  it('shows error state when fetch fails', () => {
    useParams.mockReturnValue({ id: 'so-1' })
    useServiceOrderQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    })
    renderWithProviders(<ServiceOrderForm />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      /Não foi possível carregar/i
    )
  })

  it('renders edit view with order data', () => {
    useParams.mockReturnValue({ id: 'so-1' })
    useServiceOrderQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        id: 'so-1',
        description: 'Algo',
        priority: 'Medium',
        status: 'Open',
        client: { name: 'Cliente', email: 'c@d.com' },
      },
      refetch: vi.fn(),
    })
    renderWithProviders(<ServiceOrderForm />)
    expect(screen.getByText('Editar ordem de serviço')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Algo')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /alterar status/i })
    ).toBeInTheDocument()
  })
})
