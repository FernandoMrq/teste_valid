import { Link, useParams } from 'react-router-dom'

import {
  PriorityBadge,
  StatusBadge,
  useServiceOrderQuery,
} from '../features/service-orders'
import { cn, formatDate, shortId } from '../shared/lib'
import { buttonVariants } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { PageHeader } from '../shared/ui/PageHeader'
import { Skeleton } from '../shared/ui/Skeleton'

function DetailsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando ordem de serviço">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      <Card className="space-y-4 p-6">
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-6 w-24" />
          <Skeleton variant="text" className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" className="h-3 w-20" />
          <Skeleton variant="text" className="h-5 w-full max-w-md" />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" className="h-3 w-24" />
          <Skeleton variant="text" className="h-16 w-full" />
        </div>
        <div className="grid gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2">
          <Skeleton variant="text" className="h-12 w-full" />
          <Skeleton variant="text" className="h-12 w-full" />
        </div>
      </Card>
    </div>
  )
}

export default function ServiceOrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const detailQuery = useServiceOrderQuery(id)

  if (detailQuery.isLoading) {
    return <DetailsSkeleton />
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <p className="text-sm text-danger" role="alert">
        Não foi possível carregar a ordem de serviço.
      </p>
    )
  }

  const d = detailQuery.data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`OS ${shortId(d.id)}`}
        actions={
          <Link
            to={`/service-orders/${d.id}`}
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
          >
            Editar
          </Link>
        }
      />

      <Card className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={d.status} />
          <PriorityBadge priority={d.priority} />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Cliente
          </p>
          <p className="mt-1 text-neutral-900">
            <span className="font-medium">{d.client.name}</span>
            <span className="text-neutral-500"> — {d.client.email}</span>
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Descrição
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800">
            {d.description}
          </p>
        </div>

        <dl className="grid gap-3 border-t border-neutral-100 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Criada em</dt>
            <dd className="font-medium text-neutral-900">{formatDate(d.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Atualizada em</dt>
            <dd className="font-medium text-neutral-900">{formatDate(d.updatedAt)}</dd>
          </div>
          {d.closedAt ? (
            <div>
              <dt className="text-neutral-500">Encerrada em</dt>
              <dd className="font-medium text-neutral-900">{formatDate(d.closedAt)}</dd>
            </div>
          ) : null}
        </dl>
      </Card>
    </div>
  )
}
