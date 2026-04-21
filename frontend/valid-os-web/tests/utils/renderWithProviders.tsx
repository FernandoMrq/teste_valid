import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type Keycloak from 'keycloak-js'
import { type ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { ToastProvider } from '../../src/app/providers/ToastProvider'
import {
  AuthContext,
  type AuthContextValue,
} from '../../src/features/auth/context/auth-context'
import { TooltipProvider } from '../../src/shared/ui/Tooltip'

const mockKeycloak = {
  token: 'test-token',
  tokenParsed: { sub: 'test-user', preferred_username: 'tester' },
  authenticated: true,
  login: async () => true,
  logout: async () => undefined,
  updateToken: async () => true,
} as unknown as Keycloak

const defaultAuth: AuthContextValue = {
  keycloak: mockKeycloak,
  token: 'test-token',
  initialized: true,
  authenticated: true,
  user: mockKeycloak.tokenParsed,
  logout: () => {},
}

type Options = Omit<RenderOptions, 'wrapper'> & {
  initialRoute?: string
  queryClient?: QueryClient
  auth?: AuthContextValue
}

export function renderWithProviders(ui: ReactElement, options?: Options) {
  const {
    initialRoute = '/',
    queryClient: queryClientOption,
    auth = defaultAuth,
    ...renderOptions
  } = options ?? {}

  const queryClient =
    queryClientOption ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthContext.Provider value={auth}>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
            </ToastProvider>
          </QueryClientProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
