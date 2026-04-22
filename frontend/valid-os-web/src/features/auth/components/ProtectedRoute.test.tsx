import { render, screen } from '@testing-library/react'
import type Keycloak from 'keycloak-js'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import {
  AuthContext,
  type AuthContextValue,
} from '../context/auth-context'

import { ProtectedRoute } from './ProtectedRoute'

function renderWithAuth(auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Conteúdo protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

const kc = { authenticated: false } as unknown as Keycloak

describe('ProtectedRoute', () => {
  it('renders loading placeholder when not initialized', () => {
    renderWithAuth({
      keycloak: kc,
      initialized: false,
      authenticated: false,
      user: undefined,
      logout: () => {},
    })
    expect(screen.getByText('Carregando autenticação')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
  })

  it('renders loading when initialized but not authenticated', () => {
    renderWithAuth({
      keycloak: kc,
      initialized: true,
      authenticated: false,
      user: undefined,
      logout: () => {},
    })
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
  })

  it('renders outlet when authenticated', () => {
    renderWithAuth({
      keycloak: kc,
      initialized: true,
      authenticated: true,
      user: { sub: 'u1' },
      logout: () => {},
    })
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })
})
