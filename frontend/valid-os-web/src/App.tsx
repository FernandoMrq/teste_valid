import { Suspense } from 'react'

import { AppRouter } from './app/router/AppRouter'

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div
        className="h-10 w-32 animate-pulse rounded-md bg-neutral-200"
        aria-hidden
      />
      <span className="sr-only">Carregando página</span>
    </div>
  )
}

export default function App() {
  return (
    <div className="app-shell min-h-screen bg-neutral-50 font-sans">
      <Suspense fallback={<RouteFallback />}>
        <AppRouter />
      </Suspense>
    </div>
  )
}
