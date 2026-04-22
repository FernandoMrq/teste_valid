import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
} from 'axios'

import { env } from '../../env'
import { keycloak } from '../../features/auth/lib/keycloak'

import { ApiError, type ProblemDetailsFieldErrors } from './apiError'

function parseProblemDetails(status: number, data: unknown): ApiError | null {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('title' in data) ||
    typeof (data as { title?: unknown }).title !== 'string'
  ) {
    return null
  }

  const payload = data as {
    title: string
    detail?: unknown
    errors?: unknown
  }

  let errors: ProblemDetailsFieldErrors | undefined

  if (
    typeof payload.errors === 'object' &&
    payload.errors !== null &&
    !Array.isArray(payload.errors)
  ) {
    errors = payload.errors as ProblemDetailsFieldErrors
  }

  return new ApiError(status, payload.title, `${payload.title}`, {
    detail: typeof payload.detail === 'string' ? payload.detail : undefined,
    errors,
  })
}

function getContentType(headers: AxiosResponse['headers']): string {
  if (typeof headers.get === 'function') {
    return String(headers.get('content-type') ?? '')
  }

  const raw = headers['content-type']
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0] ?? ''
  return ''
}

async function responseToApiError(response: AxiosResponse): Promise<ApiError> {
  const contentType = getContentType(response.headers)
  const parsed =
    contentType.includes('application/problem+json') ||
    contentType.includes('application/json')
      ? parseProblemDetails(response.status, response.data)
      : null

  if (parsed) {
    return parsed
  }

  return new ApiError(
    response.status,
    'Erro HTTP',
    `Erro HTTP ${response.status}`,
    {
      detail:
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data),
    }
  )
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/** Só força refresh no Keycloak se o access token expira em < 30s. Deduplica chamadas concorrentes. */
const tokenRefreshSkewSec = 30
let inFlightTokenRefresh: Promise<void> | null = null

async function ensureFreshToken() {
  const exp = keycloak.tokenParsed?.exp
  if (typeof exp === 'number') {
    const secondsLeft = exp - Math.floor(Date.now() / 1000)
    if (secondsLeft > tokenRefreshSkewSec) {
      return
    }
  }

  if (inFlightTokenRefresh) {
    return inFlightTokenRefresh
  }

  inFlightTokenRefresh = (async () => {
    try {
      await keycloak.updateToken(tokenRefreshSkewSec)
    } catch {
      void keycloak.login()
      throw new Error('Reautenticação necessária')
    } finally {
      inFlightTokenRefresh = null
    }
  })()

  return inFlightTokenRefresh
}

axiosClient.interceptors.request.use(async (config) => {
  try {
    await ensureFreshToken()
  } catch {
    throw new Error('Reautenticação necessária')
  }

  const token = keycloak.token

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : AxiosHeaders.from(config.headers ?? {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return {
    ...config,
    headers,
  }
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | Error) => {
    if (!axios.isAxiosError(error) || !error.response) {
      return Promise.reject(error)
    }

    const apiError = await responseToApiError(error.response)
    return Promise.reject(apiError)
  }
)
