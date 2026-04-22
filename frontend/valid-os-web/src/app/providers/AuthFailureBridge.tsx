import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { onAuthFailure } from '../../features/auth/lib/keycloak'

/**
 * Ponte entre o axios/keycloak e o React Query: ao detectar falha irrecuperável
 * de autenticação, limpa o cache para que nenhum componente renderize dados
 * obsoletos enquanto o redirect para o Keycloak acontece.
 */
export function AuthFailureBridge() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = onAuthFailure(() => {
      queryClient.clear()
    })
    return unsubscribe
  }, [queryClient])

  return null
}
