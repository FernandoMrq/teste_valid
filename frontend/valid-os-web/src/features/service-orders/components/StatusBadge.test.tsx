import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['Open', 'Aberta'],
    ['InProgress', 'Em andamento'],
    ['AwaitingCustomer', 'Aguardando cliente'],
    ['Resolved', 'Resolvida'],
    ['Closed', 'Encerrada'],
  ] as const)('renders label for %s', (status, label) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
