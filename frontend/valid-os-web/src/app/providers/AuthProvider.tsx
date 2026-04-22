import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { AuthContext } from '../../features/auth/context/auth-context'
import { initKeycloakOnce, keycloak } from '../../features/auth/lib/keycloak'

import { AuthSplash } from './AuthSplash'
import { PostLoginPrefetch } from './PostLoginPrefetch'

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    keycloak.onTokenExpired = () => {
      // Refresh proativo. Se falhar, o interceptor de 401 no axios cuidará do
      // fluxo de recuperação + redirect para login. Não chamamos login() aqui
      // para manter um único ponto de falha.
      keycloak.updateToken(30).catch(() => {
        /* delega ao interceptor */
      })
    }

    initKeycloakOnce()
      .then((auth) => {
        setAuthenticated(auth)
      })
      .finally(() => {
        setInitialized(true)
      })
  }, [])

  const value = useMemo(
    () => ({
      keycloak,
      initialized,
      authenticated,
      user: keycloak.tokenParsed ?? undefined,
      logout: () => {
        keycloak.logout().catch(() => {
          /* falha de logout ignorada: sessão pode já estar inválida */
        })
      },
    }),
    [authenticated, initialized]
  )

  return (
    <AuthContext.Provider value={value}>
      {initialized ? (
        <>
          <PostLoginPrefetch />
          {children}
        </>
      ) : (
        <AuthSplash />
      )}
    </AuthContext.Provider>
  )
}
