import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

import { ApiError } from '../api/apiError'

/** Mapeia erros RFC 7807 (`errors`) para campos do formulário (FluentValidation usa PascalCase). */
export function applyApiFieldErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  mapping: Record<string, FieldPath<T>>
) {
  if (!(err instanceof ApiError) || !err.errors) return

  for (const [apiKey, paths] of Object.entries(err.errors)) {
    const message = paths?.[0]
    if (!message) continue

    const formKey =
      mapping[apiKey] ??
      mapping[apiKey.charAt(0).toLowerCase() + apiKey.slice(1)]

    if (formKey !== undefined) {
      setError(formKey, { message })
    }
  }
}
