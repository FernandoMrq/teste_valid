import { describe, expect, it } from 'vitest'

import { ApiError } from './apiError'

describe('ApiError', () => {
  it('defaults message to title when not provided', () => {
    const err = new ApiError(400, 'Validation')
    expect(err.message).toBe('Validation')
    expect(err.title).toBe('Validation')
    expect(err.status).toBe(400)
    expect(err.name).toBe('ApiError')
    expect(err.detail).toBeUndefined()
    expect(err.errors).toBeUndefined()
  })

  it('keeps explicit message and options', () => {
    const err = new ApiError(422, 'Unprocessable', 'msg', {
      detail: 'detail text',
      errors: { Name: ['required'] },
    })

    expect(err.message).toBe('msg')
    expect(err.detail).toBe('detail text')
    expect(err.errors).toEqual({ Name: ['required'] })
  })

  it('is an Error subclass', () => {
    const err = new ApiError(500, 'boom')
    expect(err).toBeInstanceOf(Error)
  })
})
