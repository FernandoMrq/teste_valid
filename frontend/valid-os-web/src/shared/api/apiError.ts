export type ProblemDetailsFieldErrors = Record<string, string[]>

export class ApiError extends Error {
  readonly status: number

  readonly title: string

  readonly detail?: string

  readonly errors?: ProblemDetailsFieldErrors

  constructor(
    status: number,
    title: string,
    message?: string,
    options?: {
      detail?: string
      errors?: ProblemDetailsFieldErrors
    }
  ) {
    super(message ?? title)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = options?.detail
    this.errors = options?.errors
  }
}
