import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('disables prev on first page and next on last page', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Pagination page={1} pageSize={10} total={30} onChange={onChange} />
    )

    expect(screen.getByRole('button', { name: /página anterior/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /próxima página/i })).not.toBeDisabled()

    rerender(<Pagination page={3} pageSize={10} total={30} onChange={onChange} />)
    expect(screen.getByRole('button', { name: /página anterior/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /próxima página/i })).toBeDisabled()
  })

  it('emits next/prev clicks', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={2} pageSize={10} total={50} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /próxima página/i }))
    expect(onChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: /página anterior/i }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('renders ellipsis for many pages', () => {
    render(<Pagination page={10} pageSize={10} total={200} onChange={() => {}} />)
    expect(screen.getAllByText('…').length).toBeGreaterThan(0)
  })

  it('marks current page with aria-current', () => {
    render(<Pagination page={2} pageSize={10} total={30} onChange={() => {}} />)
    const current = screen.getByRole('button', { name: 'Página 2' })
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('computes at least one page when total is zero', () => {
    render(<Pagination page={1} pageSize={10} total={0} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument()
  })
})
