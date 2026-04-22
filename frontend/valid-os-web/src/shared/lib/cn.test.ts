import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('accepts arrays and objects', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c')
  })
})
