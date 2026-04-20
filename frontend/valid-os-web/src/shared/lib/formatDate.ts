import { format } from 'date-fns'

export function formatDate(date: Date | string | number): string {
  const d =
    typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date
  if (Number.isNaN(d.getTime())) {
    return '—'
  }
  return format(d, 'dd/MM/yyyy HH:mm')
}
