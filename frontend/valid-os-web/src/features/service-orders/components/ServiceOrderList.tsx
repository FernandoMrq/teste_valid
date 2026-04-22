import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '../../../shared/lib'
import { buttonVariants } from '../../../shared/ui/Button/button-variants'
import { DataTable, TableSkeleton } from '../../../shared/ui/DataTable'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Pagination } from '../../../shared/ui/Pagination'
import { PageHeader } from '../../../shared/ui/PageHeader'

import { useServiceOrdersQuery } from '../api/useServiceOrdersQuery'
import type { ServiceOrderDto } from '../types'

import {
  ServiceOrderFilters,
  type ServiceOrderFilterValues,
} from './ServiceOrderFilters'
import { ServiceOrderListItem } from './ServiceOrderListItem'

const PAGE_SIZE = 20

function hasActiveFilters(f: ServiceOrderFilterValues) {
  return f.status != null || f.priority != null || f.clientId != null
}

function renderServiceOrderSummaryCell(row: ServiceOrderDto) {
  return <ServiceOrderListItem order={row} />
}

function renderServiceOrderActionsCell(row: ServiceOrderDto) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        to={`/service-orders/${row.id}/details`}
      >
        Detalhes
      </Link>
      <Link
        className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
        to={`/service-orders/${row.id}`}
      >
        Editar
      </Link>
    </div>
  )
}

export function ServiceOrderList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ServiceOrderFilterValues>({
    status: undefined,
    priority: undefined,
    clientId: undefined,
  })

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      status: filters.status,
      priority: filters.priority,
      clientId: filters.clientId,
    }),
    [page, filters]
  )

  const { data, isLoading, isError, error } = useServiceOrdersQuery(queryParams)

  const columns = useMemo(
    () => [
      {
        header: 'Ordem de serviço',
        accessor: 'id' as const,
        cell: renderServiceOrderSummaryCell,
      },
      {
        header: '',
        accessor: 'id' as const,
        cell: renderServiceOrderActionsCell,
      },
    ],
    []
  )

  const newOsLink = (
    <Link
      to="/service-orders/new"
      className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
    >
      <Plus className="h-4 w-4" aria-hidden />
      Nova OS
    </Link>
  )

  const listSection = (() => {
    if (isLoading) {
      return <TableSkeleton columns={2} rows={5} />
    }
    if (isError) {
      return (
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'Não foi possível carregar as OS.'}
        </p>
      )
    }
    return (
      <>
        <DataTable<ServiceOrderDto>
          columns={columns}
          rows={data?.items ?? []}
          getRowId={(row) => row.id}
          emptyContent={
            hasActiveFilters(filters) ? (
              <EmptyState
                className="m-2 border-0 bg-transparent"
                title="Nenhuma ordem encontrada"
                description="Ajuste os filtros ou cadastre uma nova ordem de serviço."
                action={newOsLink}
              />
            ) : (
              <EmptyState
                className="m-2 border-0 bg-transparent"
                title="Nenhuma ordem de serviço ainda"
                description="Crie a primeira ordem para acompanhar atendimentos e status."
                action={newOsLink}
              />
            )
          }
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
      <PageHeader
        title="Ordens de serviço"
        actions={newOsLink}
      />

      <ServiceOrderFilters
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      {listSection}
    </div>
  )
}
