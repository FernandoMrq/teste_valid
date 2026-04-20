import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { AuthContext } from '../../features/auth/context/auth-context'
import { keycloak } from '../../features/auth/lib/keycloak'

function Skeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div
        className="h-10 w-48 animate-pulse rounded-md bg-neutral-200"
        aria-hidden
      />
      <span className="sr-only">Carregando autenticação</span>
    </div>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    keycloak.onTokenExpired = () =>
      keycloak.updateToken(30).catch(() => {
        void keycloak.login()
      })

    keycloak.onAuthRefreshSuccess = () => {
      setToken(keycloak.token)
    }

    void keycloak
      .init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((auth) => {
        setAuthenticated(auth)
        setToken(keycloak.token)
      })
      .finally(() => {
        setInitialized(true)
      })
  }, [])

  const value = useMemo(
    () => ({
      keycloak,
      token,
      authenticated,
      user: keycloak.tokenParsed ?? undefined,
      logout: () => {
        void keycloak.logout()
      },
    }),
    [authenticated, token]
  )

  if (!initialized) {
    return <Skeleton />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
