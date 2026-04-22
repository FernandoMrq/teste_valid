import { useQueries } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { serviceOrdersQueryOptions } from '../features/service-orders'
import { cn } from '../shared/lib'
import { buttonVariants } from '../shared/ui/Button/button-variants'

const openStatuses = ['Open', 'InProgress', 'AwaitingCustomer', 'Resolved'] as const

function MetricTile(props: {
  label: string
  value: string | number
  loading: boolean
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{props.label}</p>
      {props.loading ? (
        <p className="mt-2 text-2xl font-semibold text-neutral-300">—</p>
      ) : (
        <p className="mt-2 text-3xl font-semibold tabular-nums text-neutral-900">
          {props.value}
        </p>
      )}
      {props.hint ? (
        <p className="mt-2 text-xs text-neutral-500">{props.hint}</p>
      ) : null}
    </div>
  )
}

export default function DashboardPage() {
  const [qOpen, qInProgress, qAwaiting, qResolved, qCritical, qClosed] = useQueries({
    queries: [
      serviceOrdersQueryOptions({ page: 1, pageSize: 1, status: 'Open' }),
      serviceOrdersQueryOptions({ page: 1, pageSize: 1, status: 'InProgress' }),
      serviceOrdersQueryOptions({ page: 1, pageSize: 1, status: 'AwaitingCustomer' }),
      serviceOrdersQueryOptions({ page: 1, pageSize: 1, status: 'Resolved' }),
      serviceOrdersQueryOptions({ page: 1, pageSize: 500, priority: 'Critical' }),
      serviceOrdersQueryOptions({ page: 1, pageSize: 500, status: 'Closed' }),
    ],
  })

  const totalAbertas = useMemo(
    () =>
      (qOpen.data?.total ?? 0) +
      (qInProgress.data?.total ?? 0) +
      (qAwaiting.data?.total ?? 0) +
      (qResolved.data?.total ?? 0),
    [qOpen.data, qInProgress.data, qAwaiting.data, qResolved.data]
  )

  const criticalAbertas = useMemo(() => {
    const items = qCritical.data?.items ?? []
    return items.filter((o) => o.status !== 'Closed').length
  }, [qCritical.data])

  const fechadasUltimos7Dias = useMemo(() => {
    const cutoff = subDays(new Date(), 7)
    const items = qClosed.data?.items ?? []
    return items.filter(
      (o) => o.closedAt !== null && new Date(o.closedAt) >= cutoff
    ).length
  }, [qClosed.data])

  const loading =
    qOpen.isLoading ||
    qInProgress.isLoading ||
    qAwaiting.isLoading ||
    qResolved.isLoading ||
    qCritical.isLoading ||
    qClosed.isLoading

  const criticalHint =
    (qCritical.data?.total ?? 0) > (qCritical.data?.items.length ?? 0)
      ? 'Contagem parcial: há mais itens além da primeira página.'
      : undefined

  const closedHint =
    (qClosed.data?.total ?? 0) > (qClosed.data?.items.length ?? 0)
      ? 'Contagem parcial entre as OS encerradas carregadas.'
      : undefined

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Resumo das ordens de serviço. Métricas agregam totais por status na API e
          amostras paginadas onde indicado.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricTile
          label="Total em aberto"
          value={totalAbertas}
          loading={loading}
          hint={`Soma de: ${openStatuses.join(', ')}.`}
        />
        <MetricTile
          label="Críticas (não encerradas)"
          value={criticalAbertas}
          loading={loading}
          hint={criticalHint}
        />
        <MetricTile
          label="Encerradas (últimos 7 dias)"
          value={fechadasUltimos7Dias}
          loading={loading}
          hint={closedHint}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-neutral-700">Ações rápidas</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              to="/service-orders/new"
              className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nova ordem de serviço
            </Link>
            <Link
              to="/clients/new"
              className={cn(buttonVariants({ variant: 'secondary', size: 'md' }))}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Novo cliente
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/service-orders"
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            Ver ordens de serviço
          </Link>
          <span className="text-neutral-300" aria-hidden>
            |
          </span>
          <Link
            to="/clients"
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            Ver clientes
          </Link>
        </div>
      </div>
    </div>
  )
}
