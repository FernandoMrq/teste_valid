import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-md text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
        Página não encontrada
      </h1>
      <p className="mt-2 text-neutral-600">
        O endereço não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
