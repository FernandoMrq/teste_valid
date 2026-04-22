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
  initPromise ??= keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: `${globalThis.location.origin}/silent-check-sso.html`,
  })
  return initPromise
}

type AuthFailureListener = () => void
const authFailureListeners = new Set<AuthFailureListener>()

/**
 * Registra um listener chamado quando a reautenticação falha de forma irrecuperável
 * (refresh token inválido/expirado). Usado para limpar cache do React Query antes
 * do redirect para o login, evitando que componentes renderizem dados obsoletos.
 */
export function onAuthFailure(listener: AuthFailureListener): () => void {
  authFailureListeners.add(listener)
  return () => {
    authFailureListeners.delete(listener)
  }
}

export function emitAuthFailure(): void {
  for (const listener of authFailureListeners) {
    try {
      listener()
    } catch {
      // ignorado: um listener falho não pode impedir o fluxo de logout
    }
  }
}
