import { z } from 'zod'

const priorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical'])

export const createServiceOrderSchema = z.object({
  clientId: z.string().uuid(),
  description: z.string().trim().min(10).max(4000),
  priority: priorityEnum,
})

export type CreateServiceOrderFormValues = z.infer<
  typeof createServiceOrderSchema
>
