import { createContext } from 'react'

import type Keycloak from 'keycloak-js'

export type AuthContextValue = {
  keycloak: Keycloak
  initialized: boolean
  authenticated: boolean
  user: Keycloak['tokenParsed'] | undefined
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
