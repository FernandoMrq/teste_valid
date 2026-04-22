import { describe, expect, it } from 'vitest'

import { clientFormSchema } from './clientSchema'

describe('clientFormSchema', () => {
  it('accepts minimal valid payload', () => {
    const parsed = clientFormSchema.parse({
      name: 'Acme',
      email: 'a@x.com',
    })
    expect(parsed.name).toBe('Acme')
    expect(parsed.documentValue).toBeUndefined()
  })

  it('rejects short name', () => {
    expect(() =>
      clientFormSchema.parse({ name: 'A', email: 'a@x.com' })
    ).toThrow()
  })

  it('rejects invalid email', () => {
    expect(() =>
      clientFormSchema.parse({ name: 'Acme', email: 'nope' })
    ).toThrow()
  })

  it('trims surrounding whitespace', () => {
    const parsed = clientFormSchema.parse({
      name: '  Acme  ',
      email: '  a@x.com  ',
    })
    expect(parsed.name).toBe('Acme')
    expect(parsed.email).toBe('a@x.com')
  })

  it('accepts optional documentValue', () => {
    const parsed = clientFormSchema.parse({
      name: 'Acme',
      email: 'a@x.com',
      documentValue: '11144477735',
    })
    expect(parsed.documentValue).toBe('11144477735')
  })
})
