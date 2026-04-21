import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { AuthContext } from '../../features/auth/context/auth-context'
import { initKeycloakOnce, keycloak } from '../../features/auth/lib/keycloak'

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

    void initKeycloakOnce()
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
      initialized,
      authenticated,
      user: keycloak.tokenParsed ?? undefined,
      logout: () => {
        void keycloak.logout()
      },
    }),
    [authenticated, initialized, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
