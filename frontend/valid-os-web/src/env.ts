import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_KEYCLOAK_URL: z.string().url(),
  VITE_KEYCLOAK_REALM: z.string().min(1),
  VITE_KEYCLOAK_CLIENT: z.string().min(1),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const detail = parsed.error.flatten().fieldErrors
  console.error('[env] Variáveis inválidas ou ausentes:', detail)
  throw new Error(
    'Configuração de ambiente inválida. Copie `.env.example` para `.env` e preencha os valores.'
  )
}

export const env = parsed.data
