import { useMemo, useState } from 'react'

import { formatDate, shortId } from '../../../shared/lib'
import {
  DataTable,
  TableSkeleton,
  type DataTableColumn,
} from '../../../shared/ui/DataTable'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Pagination } from '../../../shared/ui/Pagination'
import { PageHeader } from '../../../shared/ui/PageHeader'

import { useNotificationsQuery } from '../api/useNotificationsQuery'
import type { NotificationDto } from '../types'

const PAGE_SIZE = 20

function renderNotificationOsCell(row: NotificationDto) {
  return (
    <span className="font-mono text-sm">{shortId(row.serviceOrderId)}</span>
  )
}

function renderNotificationClientCell(row: NotificationDto) {
  return <span className="font-mono text-sm">{shortId(row.clientId)}</span>
}

function renderNotificationMessageCell(row: NotificationDto) {
  return (
    <span className="max-w-md text-sm text-neutral-900">{row.message}</span>
  )
}

function renderNotificationProcessedCell(row: NotificationDto) {
  return (
    <span className="whitespace-nowrap text-sm">
      {formatDate(row.processedAt)}
    </span>
  )
}

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
        cell: renderNotificationOsCell,
      },
      {
        header: 'Cliente',
        accessor: 'clientId',
        cell: renderNotificationClientCell,
      },
      {
        header: 'Mensagem',
        accessor: 'message',
        cell: renderNotificationMessageCell,
      },
      {
        header: 'Canal',
        accessor: 'channel',
      },
      {
        header: 'Processado em',
        accessor: 'processedAt',
        cell: renderNotificationProcessedCell,
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

  const listSection = (() => {
    if (isLoading) {
      return <TableSkeleton columns={5} rows={5} />
    }
    if (isError) {
      return (
        <p className="text-sm text-danger" role="alert">
          {(error as Error).message ?? 'Não foi possível carregar as notificações.'}
        </p>
      )
    }
    return (
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
    )
  })()

  return (
    <div className="space-y-6">
      <PageHeader title="Notificações" />

      {listSection}
    </div>
  )
}
