import type { VariantProps } from 'class-variance-authority'

import { Badge } from '../../../shared/ui/Badge'
import { badgeVariants } from '../../../shared/ui/Badge/badge-variants'

import type { Priority } from '../types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const priorityVariant: Record<Priority, BadgeVariant> = {
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger',
}

const priorityLabel: Record<Priority, string> = {
  Low: 'Baixa',
  Medium: 'Média',
  High: 'Alta',
  Critical: 'Crítica',
}

type Props = {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: Props) {
  return (
    <Badge variant={priorityVariant[priority]} className={className}>
      {priorityLabel[priority]}
    </Badge>
  )
}
