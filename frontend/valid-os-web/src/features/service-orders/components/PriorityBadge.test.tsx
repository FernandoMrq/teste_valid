import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PriorityBadge } from './PriorityBadge'

describe('PriorityBadge', () => {
  it.each([
    ['Low', 'Baixa'],
    ['Medium', 'Média'],
    ['High', 'Alta'],
    ['Critical', 'Crítica'],
  ] as const)('renders label for %s', (priority, label) => {
    render(<PriorityBadge priority={priority} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
