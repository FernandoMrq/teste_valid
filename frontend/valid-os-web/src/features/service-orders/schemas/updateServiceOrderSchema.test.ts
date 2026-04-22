import { describe, expect, it } from 'vitest'

import { updateServiceOrderSchema } from './updateServiceOrderSchema'

describe('updateServiceOrderSchema', () => {
  it('accepts valid payload', () => {
    const parsed = updateServiceOrderSchema.parse({
      description: 'Descrição suficientemente longa',
      priority: 'High',
    })
    expect(parsed.priority).toBe('High')
  })

  it('rejects description too long', () => {
    expect(() =>
      updateServiceOrderSchema.parse({
        description: 'a'.repeat(4001),
        priority: 'Low',
      })
    ).toThrow()
  })

  it('rejects empty description after trim', () => {
    expect(() =>
      updateServiceOrderSchema.parse({ description: '   ', priority: 'Low' })
    ).toThrow()
  })
})
