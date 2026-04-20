import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-neutral-100 text-neutral-800',
        info: 'bg-brand-100 text-brand-800',
        success: 'bg-emerald-100 text-emerald-900',
        warning: 'bg-amber-100 text-amber-900',
        danger: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)
