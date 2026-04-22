import { type ReactNode } from 'react'

import { cn } from '../../lib'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: Readonly<EmptyStateProps>) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center',
        className
      )}
    >
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center text-neutral-500">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description ? (
          <p className="max-w-md text-sm text-neutral-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
