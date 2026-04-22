import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from './apiError'

const keycloak = vi.hoisted(() => ({
  token: 'initial-token' as string | undefined,
  updateToken: vi.fn(),
  login: vi.fn().mockResolvedValue(undefined),
}))

const emitAuthFailure = vi.hoisted(() => vi.fn())

vi.mock('../../env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:5000',
    VITE_KEYCLOAK_URL: 'http://localhost:8080',
    VITE_KEYCLOAK_REALM: 'valid-os',
    VITE_KEYCLOAK_CLIENT: 'valid-os-web',
  },
}))

vi.mock('../../features/auth/lib/keycloak', () => ({
  keycloak,
  emitAuthFailure,
}))

const { axiosClient } = await import('./axiosClient')

function buildConfig(overrides?: Partial<InternalAxiosRequestConfig>): InternalAxiosRequestConfig {
  return {
    url: '/test',
    method: 'get',
    headers: new AxiosHeaders(),
    ...overrides,
  } as InternalAxiosRequestConfig
}

/** Minimal adapter result shape axios accepts. */
function okResponse(
  data: unknown,
  config: InternalAxiosRequestConfig
): { data: unknown; status: number; statusText: string; headers: AxiosHeaders; config: InternalAxiosRequestConfig } {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config,
  }
}

afterEach(() => {
  keycloak.token = 'initial-token'
  keycloak.updateToken.mockReset()
  keycloak.updateToken.mockResolvedValue(true)
  keycloak.login.mockClear()
  emitAuthFailure.mockClear()
})

beforeEach(() => {
  keycloak.updateToken.mockResolvedValue(true)
})

describe('axiosClient', () => {
  it('applies Authorization when keycloak has a token', async () => {
    keycloak.token = 'abc'

    const res = await axiosClient.get('/x', {
      adapter: (config) => {
        const auth = (config.headers as AxiosHeaders).get('Authorization')
        expect(auth).toBe('Bearer abc')
        return Promise.resolve(okResponse({ ok: true }, config))
      },
    })

    expect(res.data).toEqual({ ok: true })
  })

  it('omits Authorization when there is no token', async () => {
    keycloak.token = undefined

    const res = await axiosClient.get('/x', {
      adapter: (config) => {
        const h = config.headers as AxiosHeaders
        expect(h.get('Authorization')).toBeUndefined()
        return Promise.resolve(okResponse({}, config))
      },
    })

    expect(res.status).toBe(200)
  })

  it('maps error responses with application/problem+json to ApiError', async () => {
    const cfg = buildConfig()
    const err = new AxiosError('x', 'ERR', cfg, null, {
      data: { title: 'Título', detail: 'D', errors: { name: ['inválido'] } },
      status: 422,
      statusText: 'Unprocessable',
      headers: { 'content-type': 'application/problem+json', get: () => 'application/problem+json' },
      config: cfg,
    } as never)

    await expect(
      axiosClient.get('/x', {
        adapter: () => Promise.reject(err),
      })
    ).rejects.toSatisfy((e: unknown) => e instanceof ApiError && e.status === 422 && e.title === 'Título')
  })

  it('uses fallback message when body is not RFC7807', async () => {
    const cfg = buildConfig()
    const err = new AxiosError('x', 'ERR', cfg, null, {
      data: { foo: 1 },
      status: 500,
      statusText: 'Err',
      headers: { 'content-type': 'application/json', get: () => 'application/json' },
      config: cfg,
    } as never)

    await expect(
      axiosClient.get('/x', {
        adapter: () => Promise.reject(err),
      })
    ).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.status === 500 && e.title === 'Erro HTTP'
    )
  })

  it('reads content-type array when response headers are a plain object', async () => {
    const cfg = buildConfig()
    const plainHeaders: Record<string, string | string[] | undefined> = {
      'content-type': ['application/json', 'charset=utf-8'],
    }
    const err = new AxiosError('x', 'ERR', cfg, null, {
      data: { title: 'E', detail: 'd' },
      status: 400,
      statusText: 'Bad',
      headers: plainHeaders,
      config: cfg,
    } as never)

    await expect(
      axiosClient.get('/x', {
        adapter: () => Promise.reject(err),
      })
    ).rejects.toSatisfy((e: unknown) => e instanceof ApiError && (e as ApiError).title === 'E')
  })

  it('uses string response body in fallback ApiError detail', async () => {
    const cfg = buildConfig()
    const err = new AxiosError('x', 'ERR', cfg, null, {
      data: 'plain text error',
      status: 502,
      statusText: 'Bad',
      headers: { 'content-type': 'text/plain', get: () => 'text/plain' },
      config: cfg,
    } as never)

    await expect(
      axiosClient.get('/x', {
        adapter: () => Promise.reject(err),
      })
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof ApiError && e.status === 502 && e.detail === 'plain text error'
    )
  })

  it('normalizes plain object headers for auth when config has no AxiosHeaders', async () => {
    keycloak.token = 'tok'

    await axiosClient.get('/x', {
      headers: { 'X-Custom': '1' } as never,
      adapter: (config) => {
        const h = config.headers as AxiosHeaders
        expect(h.get('Authorization')).toBe('Bearer tok')
        return Promise.resolve(okResponse({}, config))
      },
    })
  })

  it('rethrows non-Axios errors', async () => {
    const plain = new Error('network down')

    await expect(
      axiosClient.get('/x', {
        adapter: () => Promise.reject(plain),
      })
    ).rejects.toBe(plain)
  })

  it('rethrows Axios errors without response (e.g. timeout)', async () => {
    const err = new AxiosError('timeout', 'ETIMEDOUT', buildConfig())

    await expect(
      axiosClient.get('/x', {
        adapter: () => Promise.reject(err),
      })
    ).rejects.toBe(err)
  })

  it('on 401 retries once after successful token refresh', async () => {
    keycloak.updateToken.mockResolvedValueOnce(true)
    keycloak.token = 'refreshed'

    let calls = 0
    const res = await axiosClient.get('/p', {
      adapter: (config) => {
        calls += 1
        if (calls === 1) {
          return Promise.reject(
            new AxiosError('401', 'ERR', config, null, {
              data: {},
              status: 401,
              statusText: 'Unauthorized',
              headers: { 'content-type': 'application/json', get: () => 'application/json' },
              config,
            } as never)
          )
        }
        expect((config.headers as AxiosHeaders).get('Authorization')).toBe('Bearer refreshed')
        return Promise.resolve(okResponse({ recovered: true }, config))
      },
    })

    expect(res.data).toEqual({ recovered: true })
    expect(calls).toBe(2)
    expect(keycloak.updateToken).toHaveBeenCalledWith(-1)
  })

  it('on 401 when refresh fails, emits auth failure, attempts login, and throws ApiError', async () => {
    keycloak.updateToken.mockResolvedValueOnce(false)
    const resBody = { title: 'Unauthorized', detail: 'x' }

    await expect(
      axiosClient.get('/p', {
        adapter: (config) =>
          Promise.reject(
            new AxiosError('401', 'ERR', config, null, {
              data: resBody,
              status: 401,
              statusText: 'Unauthorized',
              headers: { 'content-type': 'application/json', get: () => 'application/json' },
              config,
            } as never)
          ),
      })
    ).rejects.toSatisfy((e: unknown) => e instanceof ApiError && e.status === 401)

    expect(emitAuthFailure).toHaveBeenCalled()
    expect(keycloak.login).toHaveBeenCalled()
  })

  it('on 401 when updateToken throws, treats as failed recovery', async () => {
    keycloak.updateToken.mockRejectedValueOnce(new Error('refresh failed'))
    const resBody = { title: 'N', detail: 'd' }

    await expect(
      axiosClient.get('/p', {
        adapter: (config) =>
          Promise.reject(
            new AxiosError('401', 'ERR', config, null, {
              data: resBody,
              status: 401,
              statusText: 'Unauthorized',
              headers: { 'content-type': 'application/json', get: () => 'application/json' },
              config,
            } as never)
          ),
      })
    ).rejects.toSatisfy((e: unknown) => e instanceof ApiError)

    expect(emitAuthFailure).toHaveBeenCalled()
  })

  it('on 401 when refresh returns true but token is cleared, uses login path', async () => {
    keycloak.updateToken.mockImplementationOnce(async () => {
      keycloak.token = undefined
      return true
    })
    const resBody = { title: 'Sessão', detail: 'x' }

    await expect(
      axiosClient.get('/p', {
        adapter: (config) =>
          Promise.reject(
            new AxiosError('401', 'ERR', config, null, {
              data: resBody,
              status: 401,
              statusText: 'Unauthorized',
              headers: { 'content-type': 'application/json', get: () => 'application/json' },
              config,
            } as never)
          ),
      })
    ).rejects.toSatisfy((e: unknown) => e instanceof ApiError)

    expect(emitAuthFailure).toHaveBeenCalled()
    expect(keycloak.login).toHaveBeenCalled()
  })
})
