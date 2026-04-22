import type { VariantProps } from 'class-variance-authority'

import { Badge } from '../../../shared/ui/Badge'
import { badgeVariants } from '../../../shared/ui/Badge/badge-variants'

import type { ServiceOrderStatus } from '../types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const statusVariant: Record<ServiceOrderStatus, BadgeVariant> = {
  Open: 'info',
  InProgress: 'warning',
  AwaitingCustomer: 'neutral',
  Resolved: 'success',
  Closed: 'neutral',
}

const statusLabel: Record<ServiceOrderStatus, string> = {
  Open: 'Aberta',
  InProgress: 'Em andamento',
  AwaitingCustomer: 'Aguardando cliente',
  Resolved: 'Resolvida',
  Closed: 'Encerrada',
}

type Props = Readonly<{
  status: ServiceOrderStatus
  className?: string
}>

export function StatusBadge({ status, className }: Props) {
  return (
    <Badge variant={statusVariant[status]} className={className}>
      {statusLabel[status]}
    </Badge>
  )
}
