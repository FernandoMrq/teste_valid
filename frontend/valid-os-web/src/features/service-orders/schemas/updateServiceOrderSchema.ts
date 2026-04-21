import { z } from 'zod'

const priorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical'])

export const updateServiceOrderSchema = z.object({
  description: z.string().trim().min(10).max(4000),
  priority: priorityEnum,
})

export type UpdateServiceOrderFormValues = z.infer<
  typeof updateServiceOrderSchema
>
