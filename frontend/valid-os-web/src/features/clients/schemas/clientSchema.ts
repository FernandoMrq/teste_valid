import { z } from 'zod'

export const clientFormSchema = z.object({
  name: z.string().trim().min(3, 'Mínimo de 3 caracteres.').max(256),
  email: z.string().trim().email('E-mail inválido.'),
  documentValue: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>
