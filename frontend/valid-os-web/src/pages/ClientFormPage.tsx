import { useMatch, useParams } from 'react-router-dom'

import { ClientForm } from '../features/clients'

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>()
  /** Rota literal `clients/new` não popula `:id`; criar cliente só por match explícito. */
  const isCreateRoute = useMatch('/clients/new')

  if (isCreateRoute) {
    return <ClientForm variant="create" />
  }

  if (id !== undefined && id !== '') {
    return <ClientForm variant="detail" clientId={id} />
  }

  return null
}
