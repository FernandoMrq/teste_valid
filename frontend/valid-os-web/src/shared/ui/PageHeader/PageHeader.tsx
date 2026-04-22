import { type ReactNode } from 'react'

import { cn } from '../../lib'

export interface PageHeaderProps {
  title: string
  breadcrumb?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  breadcrumb,
  actions,
  className,
}: Readonly<PageHeaderProps>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        {breadcrumb ? (
          <div className="text-sm text-neutral-500">{breadcrumb}</div>
        ) : null}
        <h1 className="truncate text-2xl font-semibold text-neutral-900">
          {title}
        </h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
