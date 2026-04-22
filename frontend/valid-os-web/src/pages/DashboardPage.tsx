import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useServiceOrdersSummaryQuery } from '../features/service-orders/api/useServiceOrdersSummaryQuery'
import { cn } from '../shared/lib'
import { buttonVariants } from '../shared/ui/Button/button-variants'
import { Skeleton } from '../shared/ui/Skeleton'

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
        <Skeleton variant="text" className="mt-2 h-8 w-20" />
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
  const { data, isLoading } = useServiceOrdersSummaryQuery()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Resumo das ordens de serviço (totais agregados na API).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricTile
          label="Total em aberto"
          value={data?.openTotal ?? 0}
          loading={isLoading}
          hint={`Soma de: ${openStatuses.join(', ')}.`}
        />
        <MetricTile
          label="Críticas (não encerradas)"
          value={data?.criticalOpenCount ?? 0}
          loading={isLoading}
        />
        <MetricTile
          label="Encerradas (últimos 7 dias)"
          value={data?.closedLast7Days ?? 0}
          loading={isLoading}
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
