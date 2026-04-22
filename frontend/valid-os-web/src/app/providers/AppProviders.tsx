import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { ErrorBoundary } from '../../shared/ui/ErrorBoundary'
import { TooltipProvider } from '../../shared/ui/Tooltip'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { ToastProvider } from './ToastProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
