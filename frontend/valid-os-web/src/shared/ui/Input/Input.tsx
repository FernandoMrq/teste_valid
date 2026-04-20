import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '../../lib'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  hint?: string
  leadingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, hint, leadingIcon, id, ...props }, ref) => {
    const baseId = id ?? props.name ?? 'input'
    const hintId = hint ? `${baseId}-hint` : undefined
    const errId = error ? `${baseId}-error` : undefined
    const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        <div
          className={cn(
            'flex w-full items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors',
            'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20',
            error &&
              'border-danger focus-within:border-danger focus-within:ring-danger/20'
          )}
        >
          {leadingIcon ? (
            <span className="flex shrink-0 text-neutral-500">{leadingIcon}</span>
          ) : null}
          <input
            ref={ref}
            id={id}
            className={cn(
              'min-w-0 flex-1 border-0 bg-transparent p-0 outline-none placeholder:text-neutral-500',
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...props}
          />
        </div>
        {hint && !error ? (
          <p id={hintId} className="mt-1 text-xs text-neutral-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errId} className="mt-1 text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
