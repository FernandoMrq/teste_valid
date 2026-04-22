import { describe, expect, it } from 'vitest'

import { shortId } from './shortId'

describe('shortId', () => {
  it('returns the same string when short enough', () => {
    expect(shortId('abc123')).toBe('abc123')
    expect(shortId('123456789012')).toBe('123456789012')
  })

  it('shortens a full GUID', () => {
    expect(shortId('550e8400-e29b-41d4-a716-446655440000')).toBe('550e…0000')
  })

  it('trims surrounding whitespace', () => {
    expect(shortId('  short  ')).toBe('short')
  })
})
