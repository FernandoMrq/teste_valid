import { Link } from 'react-router-dom'

import { EmptyState } from '../shared/ui/EmptyState'

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Página não encontrada"
      description="O endereço não existe ou foi movido."
      action={
        <Link
          to="/"
          className="inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Voltar ao dashboard
        </Link>
      }
    />
  )
}
