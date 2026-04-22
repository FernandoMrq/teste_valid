import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type Keycloak from 'keycloak-js'
import { describe, expect, it, vi } from 'vitest'

const { fetchCurrentUser } = vi.hoisted(() => ({ fetchCurrentUser: vi.fn() }))

vi.mock('../api/usersApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/usersApi')>()
  return { ...actual, fetchCurrentUser }
})

import type { AuthContextValue } from '../context/auth-context'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

import { UserMenu } from './UserMenu'

function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    keycloak: { authenticated: true } as unknown as Keycloak,
    initialized: true,
    authenticated: true,
    user: { sub: 'u1' },
    logout: vi.fn(),
    ...overrides,
  }
}

describe('UserMenu', () => {
  it('renders the user display name and initials', async () => {
    fetchCurrentUser.mockResolvedValue({
      id: '1',
      name: 'Ana Souza',
      email: 'ana@example.com',
    })

    renderWithProviders(<UserMenu />, { auth: makeAuth() })

    await waitFor(() =>
      expect(screen.getAllByText('Ana Souza').length).toBeGreaterThan(0)
    )
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('calls logout when item is selected', async () => {
    fetchCurrentUser.mockResolvedValue({
      id: '1',
      name: 'Ana',
      email: 'ana@example.com',
    })
    const logout = vi.fn()

    renderWithProviders(<UserMenu />, { auth: makeAuth({ logout }) })

    const user = userEvent.setup()
    const triggers = screen.getAllByRole('button')
    await user.click(triggers[0]!)

    const sair = await screen.findByText('Sair')
    await user.click(sair)

    expect(logout).toHaveBeenCalled()
  })
})
