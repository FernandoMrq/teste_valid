import { type VariantProps } from 'class-variance-authority'
import { type HTMLAttributes } from 'react'

import { cn } from '../../lib'

import { skeletonVariants } from './skeleton-variants'

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, ...props }: Readonly<SkeletonProps>) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      aria-hidden
      {...props}
    />
  )
}
