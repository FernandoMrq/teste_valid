import Keycloak from 'keycloak-js'

import { env } from '../../../env'

export const keycloak = new Keycloak({
  url: env.VITE_KEYCLOAK_URL,
  realm: env.VITE_KEYCLOAK_REALM,
  clientId: env.VITE_KEYCLOAK_CLIENT,
})
