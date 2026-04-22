import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Dashboard" />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders breadcrumb and actions when provided', () => {
    render(
      <PageHeader
        title="T"
        breadcrumb={<span>Home / X</span>}
        actions={<button type="button">A</button>}
      />
    )
    expect(screen.getByText('Home / X')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument()
  })

  it('does not render breadcrumb/actions slots when missing', () => {
    render(<PageHeader title="T" />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
