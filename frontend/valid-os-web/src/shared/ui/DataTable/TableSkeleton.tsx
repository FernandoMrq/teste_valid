import { cn } from '../../lib'
import { Skeleton } from '../Skeleton'

type TableSkeletonProps = {
  columns: number
  rows?: number
  className?: string
}

/**
 * Placeholder de tabela com linhas animadas (evita tela "vazia" durante fetch).
 */
export function TableSkeleton({
  columns,
  rows = 5,
  className,
}: Readonly<TableSkeletonProps>) {
  const template = { gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }

  return (
    <output
      className={cn(
        'block overflow-hidden rounded-lg border border-neutral-200 bg-white',
        className
      )}
      aria-live="polite"
      aria-label="Carregando tabela"
    >
      <div
        className="grid gap-2 border-b border-neutral-100 bg-neutral-50 p-3"
        style={template}
      >
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={`h-${i}`} variant="text" className="h-4 w-24" />
        ))}
      </div>
      <ul className="divide-y divide-neutral-100">
        {Array.from({ length: rows }, (_, r) => (
          <li key={r} className="p-3">
            <div className="grid gap-2" style={template}>
              {Array.from({ length: columns }, (_, c) => (
                <Skeleton
                  key={c}
                  variant="text"
                  className={c === 0 ? 'h-4 w-full max-w-md' : 'h-4 w-20'}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </output>
  )
}
