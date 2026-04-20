import { createContext } from 'react'

import type Keycloak from 'keycloak-js'

export type AuthContextValue = {
  keycloak: Keycloak
  token: string | undefined
  authenticated: boolean
  user: Keycloak['tokenParsed']
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
