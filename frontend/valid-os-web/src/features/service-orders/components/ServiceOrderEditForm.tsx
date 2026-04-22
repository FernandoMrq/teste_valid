import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiError } from '../../../shared/api/apiError'
import { applyApiFieldErrors } from '../../../shared/lib/applyApiFieldErrors'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'
import { TextArea } from '../../../shared/ui/TextArea'

import { useUpdateServiceOrderMutation } from '../api/useUpdateServiceOrderMutation'
import {
  updateServiceOrderSchema,
  type UpdateServiceOrderFormValues,
} from '../schemas/updateServiceOrderSchema'
import type { ServiceOrderDetailsDto } from '../types'

import { priorityOptions } from './serviceOrderOptions'

const apiFieldMap: Record<string, keyof UpdateServiceOrderFormValues> = {
  Description: 'description',
  Priority: 'priority',
}

type Props = {
  order: ServiceOrderDetailsDto
}

export function ServiceOrderEditForm({ order }: Props) {
  const navigate = useNavigate()
  const updateMutation = useUpdateServiceOrderMutation()
  const syncedOrderIdRef = useRef<string | undefined>(undefined)

  const form = useForm<UpdateServiceOrderFormValues>({
    resolver: zodResolver(updateServiceOrderSchema),
    defaultValues: {
      description: order.description,
      priority: order.priority,
    },
  })

  const { isDirty, isValid } = form.formState

  useEffect(() => {
    if (syncedOrderIdRef.current !== order.id) {
      syncedOrderIdRef.current = order.id
      form.reset({
        description: order.description,
        priority: order.priority,
      })
    } else if (!form.formState.isDirty) {
      form.reset({
        description: order.description,
        priority: order.priority,
      })
    }
  }, [order, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({
        id: order.id,
        body: {
          description: values.description.trim(),
          priority: values.priority,
        },
      })
      toast.success('Ordem de serviço atualizada.')
      navigate('/service-orders')
    } catch (err) {
      applyApiFieldErrors<UpdateServiceOrderFormValues>(
        err,
        form.setError,
        apiFieldMap
      )
      if (err instanceof ApiError && !err.errors) toast.error(err.message)
      else if (!(err instanceof ApiError))
        toast.error('Não foi possível atualizar a ordem de serviço.')
    }
  })

  return (
    <Card className="p-6">
      <div className="mb-4 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
        Cliente: <span className="font-medium">{order.client.name}</span>
        <span className="text-neutral-500"> ({order.client.email})</span>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="epriority">
            Prioridade
          </label>
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="epriority" aria-label="Prioridade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="edesc">
            Descrição
          </label>
          <TextArea
            id="edesc"
            rows={6}
            error={form.formState.errors.description?.message}
            {...form.register('description')}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/service-orders')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={updateMutation.isPending}
            disabled={!isDirty || !isValid}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Card>
  )
}
