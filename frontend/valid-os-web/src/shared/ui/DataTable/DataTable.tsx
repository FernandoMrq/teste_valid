import { type ReactNode } from 'react'

import { cn } from '../../lib'

export type DataTableColumn<T> = {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  cell?: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>
  rows: T[]
  getRowId: (row: T) => string
  className?: string
  emptyContent?: ReactNode
}

function resolveCell<T>(col: DataTableColumn<T>, row: T): ReactNode {
  if (col.cell) {
    return col.cell(row)
  }
  if (typeof col.accessor === 'function') {
    return col.accessor(row)
  }
  const value = row[col.accessor] as unknown
  if (value === null || value === undefined) {
    return '—'
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value)
  }
  return JSON.stringify(value)
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  className,
  emptyContent,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className={cn('rounded-lg border border-neutral-200 bg-white', className)}>
        {emptyContent ?? (
          <p className="p-6 text-center text-sm text-neutral-500">Nenhum registro.</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm',
        className
      )}
    >
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col, colIndex) => (
              <th
                key={colIndex}
                scope="col"
                className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowId(row)}
              className="border-b border-neutral-100 last:border-0"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-neutral-900">
                  {resolveCell(col, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
