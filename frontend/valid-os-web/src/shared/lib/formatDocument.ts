function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatDocument(value: string | null | undefined): string {
  if (value == null || value === '') {
    return '—'
  }
  const trimmed = value.trim()
  const d = onlyDigits(trimmed)
  if (d.length === 11) {
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (d.length === 14) {
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return trimmed || '—'
}
