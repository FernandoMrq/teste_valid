import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '../../../shared/lib'
import { buttonVariants } from '../../../shared/ui/Button/button-variants'
import { DataTable } from '../../../shared/ui/DataTable'
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
        cell: (row: ServiceOrderDto) => <ServiceOrderListItem order={row} />,
      },
      {
        header: '',
        accessor: 'id' as const,
        cell: (row: ServiceOrderDto) => (
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
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Ordens de serviço" />

      <ServiceOrderFilters
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      {isLoading ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : isError ? (
        <p className="text-sm text-danger" role="alert">
          {(error as Error).message ?? 'Não foi possível carregar as OS.'}
        </p>
      ) : (
        <>
          <DataTable<ServiceOrderDto>
            columns={columns}
            rows={data?.items ?? []}
            getRowId={(row) => row.id}
            emptyContent={
              <p className="p-6 text-center text-sm text-neutral-500">
                Nenhuma ordem de serviço encontrada.
              </p>
            }
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
