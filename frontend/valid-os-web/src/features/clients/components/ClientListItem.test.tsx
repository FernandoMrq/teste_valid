import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ClientDto } from '../types'

import { ClientListItem } from './ClientListItem'

describe('ClientListItem', () => {
  it('renders name, email and formatted CPF', () => {
    const client: ClientDto = {
      id: 'c1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      documentType: 'Cpf',
      documentValue: '12345678909',
      createdAt: '2026-01-02T12:00:00Z',
    }

    render(<ClientListItem client={client} />)

    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('maria@example.com')).toBeInTheDocument()
    expect(screen.getByText('123.456.789-09')).toBeInTheDocument()
  })
})
