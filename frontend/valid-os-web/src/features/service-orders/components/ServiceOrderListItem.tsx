import { formatDate, shortId } from '../../../shared/lib'

import type { ServiceOrderDto } from '../types'

import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'

type Props = Readonly<{
  order: ServiceOrderDto
}>

export function ServiceOrderListItem({ order }: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="font-mono text-xs text-neutral-500">{shortId(order.id)}</div>
        <p className="line-clamp-3 text-sm text-neutral-900">{order.description}</p>
        <p className="text-xs text-neutral-500">
          Cliente:{' '}
          <span className="font-mono text-neutral-700">{shortId(order.clientId)}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <PriorityBadge priority={order.priority} />
        <StatusBadge status={order.status} />
        <span className="text-xs text-neutral-500">{formatDate(order.updatedAt)}</span>
      </div>
    </div>
  )
}
