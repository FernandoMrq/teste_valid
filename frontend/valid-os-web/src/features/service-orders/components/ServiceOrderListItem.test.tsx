import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ServiceOrderDto } from '../types'

import { ServiceOrderListItem } from './ServiceOrderListItem'

describe('ServiceOrderListItem', () => {
  it('renders id, description, priority and status', () => {
    const order: ServiceOrderDto = {
      id: '11111111-1111-1111-1111-111111111111',
      clientId: '22222222-2222-2222-2222-222222222222',
      description: 'Trocar roteador',
      priority: 'High',
      status: 'Open',
      createdByUserId: '33333333-3333-3333-3333-333333333333',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      closedAt: null,
    }

    render(<ServiceOrderListItem order={order} />)

    expect(screen.getByText('Trocar roteador')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText('Aberta')).toBeInTheDocument()
  })
})
