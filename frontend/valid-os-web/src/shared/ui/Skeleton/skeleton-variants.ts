import { cva } from 'class-variance-authority'

export const skeletonVariants = cva('animate-pulse rounded-md bg-neutral-200', {
  variants: {
    variant: {
      block: 'h-8 w-full',
      text: 'h-4 w-48 max-w-full',
      circle: 'h-10 w-10 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'block',
  },
})
