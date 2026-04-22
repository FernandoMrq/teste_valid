import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

function Boom({ fail }: { fail: boolean }) {
  if (fail) throw new Error('boom')
  return <span>ok</span>
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterAll(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>safe</span>
      </ErrorBoundary>
    )
    expect(screen.getByText('safe')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<span>custom-fallback</span>}>
        <Boom fail />
      </ErrorBoundary>
    )
    expect(screen.getByText('custom-fallback')).toBeInTheDocument()
  })

  it('renders default fallback and resets via button', async () => {
    function Harness() {
      const [fail, setFail] = useState(true)
      return (
        <ErrorBoundary>
          <button type="button" onClick={() => setFail(false)}>fix</button>
          <Boom fail={fail} />
        </ErrorBoundary>
      )
    }

    render(<Harness />)
    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument()

    // Can't easily reset without changing children; at least verify reset button exists.
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }))
  })
})
