import { renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { AuthContext, type AuthContextValue } from '../context/auth-context'

import { useAuth } from './useAuth'

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      /useAuth deve ser usado dentro de AuthProvider/
    )
  })

  it('returns context value when inside provider', () => {
    const value = {
      keycloak: {} as AuthContextValue['keycloak'],
      initialized: true,
      authenticated: true,
      user: { sub: 'kc-1' },
      logout: () => undefined,
    } satisfies AuthContextValue

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.authenticated).toBe(true)
    expect(result.current.user?.sub).toBe('kc-1')
  })
})
