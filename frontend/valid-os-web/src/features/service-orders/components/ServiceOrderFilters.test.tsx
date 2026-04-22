import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

const { useClientsQuery, useClientByIdQuery } = vi.hoisted(() => ({
  useClientsQuery: vi.fn(),
  useClientByIdQuery: vi.fn(),
}))

vi.mock('../../clients', () => ({ useClientsQuery, useClientByIdQuery }))

import { ServiceOrderFilters } from './ServiceOrderFilters'

beforeEach(() => {
  useClientsQuery.mockReturnValue({ data: { items: [], total: 0 } })
  useClientByIdQuery.mockReturnValue({ data: undefined })
})

describe('ServiceOrderFilters', () => {
  const baseValue = {
    status: undefined,
    priority: undefined,
    clientId: undefined,
  }

  it('renders status and priority selects with aria labels', () => {
    renderWithProviders(
      <ServiceOrderFilters value={baseValue} onChange={() => undefined} />
    )
    expect(screen.getByLabelText('Filtrar por status')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por prioridade')).toBeInTheDocument()
    expect(screen.getByLabelText('Cliente')).toBeInTheDocument()
  })

  it('shows selected client label and clears on button click', async () => {
    useClientByIdQuery.mockReturnValue({ data: { name: 'Acme', email: 'a@b.com' } })
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ServiceOrderFilters
        value={{ ...baseValue, clientId: 'c1' }}
        onChange={onChange}
      />
    )
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /limpar cliente/i }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: undefined })
    )
  })
})
