import { Outlet } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div
        className="h-10 w-48 animate-pulse rounded-md bg-neutral-200"
        aria-hidden
      />
      <span className="sr-only">Carregando autenticação</span>
    </div>
  )
}

export function ProtectedRoute() {
  const { initialized, authenticated } = useAuth()

  if (!initialized) {
    return <AuthLoading />
  }

  if (!authenticated) {
    return <AuthLoading />
  }

  return <Outlet />
}
