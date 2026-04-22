import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '../../env'
import { emitAuthFailure, keycloak } from '../../features/auth/lib/keycloak'

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

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

function applyAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : AxiosHeaders.from(config.headers ?? {})

  const token = keycloak.token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  config.headers = headers
  return config
}

axiosClient.interceptors.request.use((config) => applyAuthHeader(config))

/** Deduplica refreshes concorrentes disparados por várias respostas 401 simultâneas. */
let inFlightRecovery: Promise<boolean> | null = null

async function tryRecoverSession(): Promise<boolean> {
  if (!inFlightRecovery) {
    inFlightRecovery = (async () => {
      try {
        // -1 força o refresh mesmo que keycloak-js julgue o token "válido".
        const refreshed = await keycloak.updateToken(-1)
        return refreshed && !!keycloak.token
      } catch {
        return false
      } finally {
        inFlightRecovery = null
      }
    })()
  }
  return inFlightRecovery
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | Error) => {
    if (!axios.isAxiosError(error) || !error.response) {
      return Promise.reject(error)
    }

    const status = error.response.status
    const originalConfig = error.config as RetryableConfig | undefined

    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true

      const recovered = await tryRecoverSession()
      if (recovered) {
        applyAuthHeader(originalConfig)
        return axiosClient(originalConfig)
      }

      emitAuthFailure()
      void keycloak.login()
      return Promise.reject(await responseToApiError(error.response))
    }

    const apiError = await responseToApiError(error.response)
    return Promise.reject(apiError)
  }
)
