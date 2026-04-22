import { describe, expect, it } from 'vitest'

import { createServiceOrderSchema } from './createServiceOrderSchema'

describe('createServiceOrderSchema', () => {
  const valid = {
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Descrição suficientemente longa',
    priority: 'Medium' as const,
  }

  it('accepts valid payload', () => {
    expect(createServiceOrderSchema.parse(valid)).toEqual(valid)
  })

  it('rejects invalid clientId uuid', () => {
    expect(() =>
      createServiceOrderSchema.parse({ ...valid, clientId: 'no' })
    ).toThrow()
  })

  it('rejects short description', () => {
    expect(() =>
      createServiceOrderSchema.parse({ ...valid, description: 'short' })
    ).toThrow()
  })

  it('rejects unknown priority', () => {
    expect(() =>
      createServiceOrderSchema.parse({ ...valid, priority: 'Urgent' })
    ).toThrow()
  })
})
