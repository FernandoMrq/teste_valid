import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '../../../shared/ui/DataTable'
import { Input } from '../../../shared/ui/Input'
import { Pagination } from '../../../shared/ui/Pagination'
import { PageHeader } from '../../../shared/ui/PageHeader'

import { useClientsQuery } from '../api/useClientsQuery'
import type { ClientDto } from '../types'

import { ClientListItem } from './ClientListItem'

const PAGE_SIZE = 20

export function ClientList() {
  const [page, setPage] = useState(1)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim() === '' ? undefined : search.trim(),
    }),
    [page, search]
  )

  const { data, isLoading, isError, error } = useClientsQuery(queryParams)

  const columns = useMemo(
    () => [
      {
        header: 'Cliente',
        accessor: 'name' as const,
        cell: (row: ClientDto) => <ClientListItem client={row} />,
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <form
          className="flex flex-1 flex-col gap-2 sm:max-w-md"
          onSubmit={(e) => {
            e.preventDefault()
            setSearch(searchDraft)
            setPage(1)
          }}
        >
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
        </form>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : isError ? (
        <p className="text-sm text-danger" role="alert">
          {(error as Error).message ?? 'Não foi possível carregar os clientes.'}
        </p>
      ) : (
        <>
          <DataTable<ClientDto>
            columns={columns}
            rows={data?.items ?? []}
            getRowId={(row) => row.id}
            emptyContent={
              <p className="p-6 text-center text-sm text-neutral-500">
                Nenhum cliente encontrado.
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
