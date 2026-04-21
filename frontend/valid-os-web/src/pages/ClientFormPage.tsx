import { useParams } from 'react-router-dom'

import { ClientForm } from '../features/clients'

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>()

  if (id === 'new') {
    return <ClientForm variant="create" />
  }

  if (id !== undefined && id !== '') {
    return <ClientForm variant="detail" clientId={id} />
  }

  return null
}
