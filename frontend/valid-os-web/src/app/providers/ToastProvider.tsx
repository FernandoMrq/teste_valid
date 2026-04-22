import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </>
  )
}
