import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white shadow-sm hover:bg-brand-400',
        secondary:
          'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100',
        ghost: 'text-neutral-700 hover:bg-neutral-100',
        danger: 'bg-danger text-white shadow-sm hover:bg-red-700',
        link: 'text-brand-600 underline-offset-4 shadow-none hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)
