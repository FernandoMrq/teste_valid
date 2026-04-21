import { useMemo, useState } from 'react'

import { formatDate, shortId } from '../../../shared/lib'
import {
  DataTable,
  type DataTableColumn,
} from '../../../shared/ui/DataTable'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Pagination } from '../../../shared/ui/Pagination'
import { PageHeader } from '../../../shared/ui/PageHeader'

import { useNotificationsQuery } from '../api/useNotificationsQuery'
import type { NotificationDto } from '../types'

const PAGE_SIZE = 20

export function NotificationList() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useNotificationsQuery({
    page,
    pageSize: PAGE_SIZE,
  })

  const columns = useMemo(
    (): DataTableColumn<NotificationDto>[] => [
      {
        header: 'OS',
        accessor: 'serviceOrderId',
        cell: (row) => (
          <span className="font-mono text-sm">{shortId(row.serviceOrderId)}</span>
        ),
      },
      {
        header: 'Cliente',
        accessor: 'clientId',
        cell: (row) => (
          <span className="font-mono text-sm">{shortId(row.clientId)}</span>
        ),
      },
      {
        header: 'Mensagem',
        accessor: 'message',
        cell: (row) => (
          <span className="max-w-md text-sm text-neutral-900">{row.message}</span>
        ),
      },
      {
        header: 'Canal',
        accessor: 'channel',
      },
      {
        header: 'Processado em',
        accessor: 'processedAt',
        cell: (row) => (
          <span className="whitespace-nowrap text-sm">
            {formatDate(row.processedAt)}
          </span>
        ),
      },
    ],
    []
  )

  const empty = (
    <EmptyState
      title="Nenhum evento processado"
      description="Quando o worker processar notificações, elas aparecerão nesta lista."
    />
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Notificações" />

      {isLoading ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : isError ? (
        <p className="text-sm text-danger" role="alert">
          {(error as Error).message ?? 'Não foi possível carregar as notificações.'}
        </p>
      ) : (
        <>
          <DataTable<NotificationDto>
            columns={columns}
            rows={data?.items ?? []}
            getRowId={(row) => row.id}
            emptyContent={empty}
          />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}
