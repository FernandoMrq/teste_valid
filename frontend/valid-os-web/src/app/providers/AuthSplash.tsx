import { Loader2 } from 'lucide-react'

export function AuthSplash() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-lg font-semibold text-brand-900">Valid OS</p>
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" aria-hidden />
      <p className="text-sm text-neutral-600">Inicializando sessão…</p>
    </div>
  )
}
