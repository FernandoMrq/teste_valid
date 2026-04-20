import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../../lib'
import { Button } from '../Button'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
  className?: string
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), totalPages)

  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return range(1, totalPages)
    }
    if (current <= 4) {
      return [...range(1, 5), -1, totalPages]
    }
    if (current >= totalPages - 3) {
      return [1, -1, ...range(totalPages - 4, totalPages)]
    }
    return [1, -1, current - 1, current, current + 1, -1, totalPages]
  }, [current, totalPages])

  return (
    <nav
      className={cn('flex flex-wrap items-center gap-2', className)}
      aria-label="Paginação"
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label="Página anterior"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex flex-wrap items-center gap-1">
        {pages.map((p, i) =>
          p === -1 ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-sm text-neutral-500"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              type="button"
              variant={p === current ? 'primary' : 'ghost'}
              size="sm"
              aria-current={p === current ? 'page' : undefined}
              aria-label={`Página ${p}`}
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          )
        )}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label="Próxima página"
        disabled={current >= totalPages}
        onClick={() => onChange(current + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
