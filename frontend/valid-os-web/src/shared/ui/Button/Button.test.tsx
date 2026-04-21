import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it.each([
    ['primary', 'bg-brand-500'],
    ['secondary', 'border-neutral-300'],
    ['ghost', 'hover:bg-neutral-100'],
    ['danger', 'bg-danger'],
    ['link', 'text-brand-600'],
  ] as const)('applies classes for variant %s', (variant, fragment) => {
    render(<Button variant={variant}>Label</Button>)
    expect(screen.getByRole('button', { name: 'Label' }).className).toContain(
      fragment
    )
  })

  it('fires onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
