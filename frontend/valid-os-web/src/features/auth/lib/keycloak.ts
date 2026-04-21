import Keycloak from 'keycloak-js'

import { env } from '../../../env'

export const keycloak = new Keycloak({
  url: env.VITE_KEYCLOAK_URL,
  realm: env.VITE_KEYCLOAK_REALM,
  clientId: env.VITE_KEYCLOAK_CLIENT,
})

let initPromise: Promise<boolean> | null = null

/**
 * Ensures `keycloak.init` runs once. React 18 Strict Mode mounts effects twice;
 * a second concurrent `init` breaks PKCE / hash handling and causes redirect loops.
 */
export function initKeycloakOnce(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
  }
  return initPromise
}
