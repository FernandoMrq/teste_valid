import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '../api/apiError'

import { applyApiFieldErrors } from './applyApiFieldErrors'

describe('applyApiFieldErrors', () => {
  it('does nothing when error is not ApiError', () => {
    const setError = vi.fn()
    applyApiFieldErrors(new Error('x'), setError, { Name: 'name' })
    expect(setError).not.toHaveBeenCalled()
  })

  it('does nothing when ApiError has no errors', () => {
    const setError = vi.fn()
    applyApiFieldErrors(new ApiError(400, 'bad'), setError, { Name: 'name' })
    expect(setError).not.toHaveBeenCalled()
  })

  it('maps PascalCase api keys to form fields', () => {
    const setError = vi.fn()
    const err = new ApiError(400, 'bad', undefined, {
      errors: { Name: ['required'], Email: ['invalid'] },
    })

    applyApiFieldErrors(err, setError, { Name: 'name', Email: 'email' })

    expect(setError).toHaveBeenCalledWith('name', { message: 'required' })
    expect(setError).toHaveBeenCalledWith('email', { message: 'invalid' })
  })

  it('falls back to camelCase mapping key', () => {
    const setError = vi.fn()
    const err = new ApiError(400, 'bad', undefined, {
      errors: { Name: ['required'] },
    })

    applyApiFieldErrors(err, setError, { name: 'name' })

    expect(setError).toHaveBeenCalledWith('name', { message: 'required' })
  })

  it('skips unmapped keys and empty arrays', () => {
    const setError = vi.fn()
    const err = new ApiError(400, 'bad', undefined, {
      errors: { Unknown: ['x'], Empty: [] },
    })

    applyApiFieldErrors(err, setError, { Name: 'name' })
    expect(setError).not.toHaveBeenCalled()
  })
})
