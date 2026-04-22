import { describe, expect, it } from 'vitest'

import { formatDocument } from './formatDocument'

describe('formatDocument', () => {
  it('formats CPF', () => {
    expect(formatDocument('11144477735')).toBe('111.444.777-35')
  })

  it('formats CNPJ', () => {
    expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('keeps existing mask by re-parsing digits', () => {
    expect(formatDocument('111.444.777-35')).toBe('111.444.777-35')
  })

  it('returns dash for null/empty', () => {
    expect(formatDocument(null)).toBe('—')
    expect(formatDocument(undefined)).toBe('—')
    expect(formatDocument('')).toBe('—')
  })

  it('returns original trimmed for unsupported length', () => {
    expect(formatDocument('  123  ')).toBe('123')
  })
})
