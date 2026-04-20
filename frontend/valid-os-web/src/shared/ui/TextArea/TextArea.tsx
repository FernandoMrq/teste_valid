import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react'

import { cn } from '../../lib'

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else ref.current = node
    }
  }
}

function useAutoResize(enabled: boolean) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null)

  const adjust = useCallback(() => {
    const el = innerRef.current
    if (!el || !enabled) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [enabled])

  useLayoutEffect(() => {
    adjust()
  }, [adjust])

  return { innerRef, adjust }
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  hint?: string
  autoResize?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      error,
      hint,
      autoResize = false,
      id,
      value,
      defaultValue,
      onChange,
      rows = 3,
      ...props
    },
    forwardedRef
  ) => {
    const { innerRef, adjust } = useAutoResize(autoResize)
    const baseId = id ?? props.name ?? 'textarea'
    const hintId = hint ? `${baseId}-hint` : undefined
    const errId = error ? `${baseId}-error` : undefined
    const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined

    useLayoutEffect(() => {
      adjust()
    }, [adjust, value, defaultValue])

    return (
      <div className="w-full">
        <textarea
          ref={mergeRefs(innerRef, forwardedRef)}
          id={id}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            onChange?.(e)
            if (autoResize) adjust()
          }}
          className={cn(
            'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition-colors',
            'placeholder:text-neutral-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            autoResize && 'resize-none overflow-hidden',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            !autoResize && 'resize-y',
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
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
TextArea.displayName = 'TextArea'
