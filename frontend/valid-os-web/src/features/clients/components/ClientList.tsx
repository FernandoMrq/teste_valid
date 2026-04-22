import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useDebounce } from '../../../shared/hooks/useDebounce'
import { cn } from '../../../shared/lib'
import { buttonVariants } from '../../../shared/ui/Button/button-variants'
import { DataTable, TableSkeleton } from '../../../shared/ui/DataTable'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Input } from '../../../shared/ui/Input'
import { Pagination } from '../../../shared/ui/Pagination'
import { PageHeader } from '../../../shared/ui/PageHeader'

import { useClientsQuery } from '../api/useClientsQuery'
import type { ClientDto } from '../types'

import { ClientListItem } from './ClientListItem'

const PAGE_SIZE = 20

function renderClientNameCell(row: ClientDto) {
  return <ClientListItem client={row} />
}

export function ClientList() {
  const [page, setPage] = useState(1)
  const [searchDraft, setSearchDraft] = useState('')
  const debouncedSearch = useDebounce(searchDraft, 300)
  const search = debouncedSearch.trim() === '' ? '' : debouncedSearch.trim()

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search === '' ? undefined : search,
    }),
    [page, search]
  )

  useEffect(() => {
    setPage(1)
  }, [search])

  const { data, isLoading, isError, error } = useClientsQuery(queryParams)

  const newClientLink = (
    <Link
      to="/clients/new"
      className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
    >
      <Plus className="h-4 w-4" aria-hidden />
      Novo cliente
    </Link>
  )

  const columns = useMemo(
    () => [
      {
        header: 'Cliente',
        accessor: 'name' as const,
        cell: renderClientNameCell,
      },
    ],
    []
  )

  const listSection = (() => {
    if (isLoading) {
      return <TableSkeleton columns={1} rows={5} />
    }
    if (isError) {
      return (
        <p className="text-sm text-danger" role="alert">
          {(error as Error).message ?? 'Não foi possível carregar os clientes.'}
        </p>
      )
    }
    return (
      <>
        <DataTable<ClientDto>
          columns={columns}
          rows={data?.items ?? []}
          getRowId={(row) => row.id}
          emptyContent={
            search === '' ? (
              <EmptyState
                className="m-2 border-0 bg-transparent"
                title="Nenhum cliente cadastrado"
                description="Adicione clientes para vinculá-los às ordens de serviço."
                action={newClientLink}
              />
            ) : (
              <EmptyState
                className="m-2 border-0 bg-transparent"
                title="Nenhum resultado"
                description="Nenhum cliente corresponde a essa busca. Tente outro termo ou cadastre um novo cliente."
                action={newClientLink}
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
      <PageHeader title="Clientes" actions={newClientLink} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2 sm:max-w-md">
          <label className="text-sm font-medium text-neutral-700" htmlFor="client-search">
            Buscar
          </label>
          <Input
            id="client-search"
            name="search"
            placeholder="Nome ou e-mail"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            leadingIcon={<Search className="h-4 w-4" aria-hidden />}
          />
        </div>
      </div>

      {listSection}
    </div>
  )
}
