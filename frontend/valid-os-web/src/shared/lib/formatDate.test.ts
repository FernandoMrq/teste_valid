import { describe, expect, it } from 'vitest'

import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats Date instances as dd/MM/yyyy HH:mm', () => {
    const d = new Date(2024, 0, 15, 9, 5)
    expect(formatDate(d)).toBe('15/01/2024 09:05')
  })

  it('parses ISO strings', () => {
    expect(formatDate('2024-01-15T09:05:00')).toMatch(/^15\/01\/2024 \d{2}:05$/)
  })

  it('parses numeric timestamps', () => {
    const ts = new Date(2024, 5, 1, 10, 0).getTime()
    expect(formatDate(ts)).toBe('01/06/2024 10:00')
  })

  it('returns em-dash for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('—')
  })
})
