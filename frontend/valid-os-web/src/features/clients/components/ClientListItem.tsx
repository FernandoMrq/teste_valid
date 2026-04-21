import { formatDate, formatDocument } from '../../../shared/lib'

import type { ClientDto } from '../types'

type Props = {
  client: ClientDto
}

/** Linha da tabela: destaca nome/e-mail e formata documento e data de cadastro. */
export function ClientListItem({ client }: Props) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="truncate font-medium text-neutral-900">{client.name}</div>
        <div className="truncate text-xs text-neutral-500">{client.email}</div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
        <span className="font-mono">{formatDocument(client.documentValue)}</span>
        <span>{formatDate(client.createdAt)}</span>
      </div>
    </div>
  )
}
