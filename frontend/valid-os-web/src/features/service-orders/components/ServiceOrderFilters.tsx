import { X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useDebounce } from '../../../shared/hooks/useDebounce'
import { cn } from '../../../shared/lib'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'
import { useClientByIdQuery, useClientsQuery } from '../../clients'

import type { Priority, ServiceOrderStatus } from '../types'

const ALL = '__all__'

export type ServiceOrderFilterValues = {
  status: ServiceOrderStatus | undefined
  priority: Priority | undefined
  clientId: string | undefined
}

type Props = Readonly<{
  value: ServiceOrderFilterValues
  onChange: (next: ServiceOrderFilterValues) => void
  className?: string
}>

export function ServiceOrderFilters({ value, onChange, className }: Props) {
  const [clientSearch, setClientSearch] = useState('')
  const debouncedSearch = useDebounce(clientSearch, 300)

  const clientQuery = useClientsQuery({
    page: 1,
    pageSize: 20,
    search:
      debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined,
  })

  const selectedClient = useClientByIdQuery(value.clientId)

  const selectedClientLabel = useMemo(() => {
    const d = selectedClient.data
    return d?.name ?? d?.email
  }, [selectedClient.data])

  const showSuggestions =
    clientSearch.trim().length >= 2 &&
    clientQuery.data &&
    clientQuery.data.items.length > 0 &&
    value.clientId === undefined

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end',
        className
      )}
    >
      <div className="space-y-1.5 sm:w-44">
        <label className="text-sm font-medium text-neutral-700" htmlFor="so-status">
          Status
        </label>
        <Select
          value={value.status ?? ALL}
          onValueChange={(v) =>
            onChange({
              ...value,
              status: v === ALL ? undefined : (v as ServiceOrderStatus),
            })
          }
        >
          <SelectTrigger id="so-status" aria-label="Filtrar por status">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="Open">Aberta</SelectItem>
            <SelectItem value="InProgress">Em andamento</SelectItem>
            <SelectItem value="AwaitingCustomer">Aguardando cliente</SelectItem>
            <SelectItem value="Resolved">Resolvida</SelectItem>
            <SelectItem value="Closed">Encerrada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:w-44">
        <label
          className="text-sm font-medium text-neutral-700"
          htmlFor="so-priority"
        >
          Prioridade
        </label>
        <Select
          value={value.priority ?? ALL}
          onValueChange={(v) =>
            onChange({
              ...value,
              priority: v === ALL ? undefined : (v as Priority),
            })
          }
        >
          <SelectTrigger id="so-priority" aria-label="Filtrar por prioridade">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            <SelectItem value="Low">Baixa</SelectItem>
            <SelectItem value="Medium">Média</SelectItem>
            <SelectItem value="High">Alta</SelectItem>
            <SelectItem value="Critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative min-w-[12rem] flex-1 space-y-1.5">
        <label className="text-sm font-medium text-neutral-700" htmlFor="so-client">
          Cliente
        </label>
        <div className="flex gap-2">
          <Input
            id="so-client"
            autoComplete="off"
            placeholder="Buscar por nome ou e-mail (mín. 2 caracteres)"
            value={
              value.clientId
                ? (selectedClientLabel ?? '')
                : clientSearch
            }
            onChange={(e) => {
              if (value.clientId) {
                onChange({ ...value, clientId: undefined })
              }
              setClientSearch(e.target.value)
            }}
            aria-autocomplete="list"
            aria-controls="so-client-suggestions"
            aria-expanded={showSuggestions}
          />
          {value.clientId ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Limpar cliente"
              onClick={() => {
                onChange({ ...value, clientId: undefined })
                setClientSearch('')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        {showSuggestions ? (
          <ul
            id="so-client-suggestions"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-md"
            aria-label="Sugestões de cliente"
          >
            {clientQuery.data.items.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="flex w-full flex-col px-3 py-2 text-left hover:bg-neutral-50"
                  onClick={() => {
                    onChange({ ...value, clientId: c.id })
                    setClientSearch('')
                  }}
                >
                  <span className="font-medium text-neutral-900">{c.name}</span>
                  <span className="text-xs text-neutral-500">{c.email}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
