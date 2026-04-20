import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { TooltipProvider } from '../../shared/ui/Tooltip'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { ToastProvider } from './ToastProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryProvider>
          <ToastProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </ToastProvider>
        </QueryProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
