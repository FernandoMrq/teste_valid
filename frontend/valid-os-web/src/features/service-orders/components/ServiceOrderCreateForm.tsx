import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiError } from '../../../shared/api/apiError'
import { applyApiFieldErrors } from '../../../shared/lib/applyApiFieldErrors'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'
import { TextArea } from '../../../shared/ui/TextArea'
import { useClientsQuery } from '../../clients'

import { useCreateServiceOrderMutation } from '../api/useCreateServiceOrderMutation'
import {
  createServiceOrderSchema,
  type CreateServiceOrderFormValues,
} from '../schemas/createServiceOrderSchema'

import { priorityOptions } from './serviceOrderOptions'

const apiFieldMap: Record<string, keyof CreateServiceOrderFormValues> = {
  ClientId: 'clientId',
  Description: 'description',
  Priority: 'priority',
}

export function ServiceOrderCreateForm() {
  const navigate = useNavigate()
  const createMutation = useCreateServiceOrderMutation()
  const [clientSearch, setClientSearch] = useState('')

  const clientsQuery = useClientsQuery({
    page: 1,
    pageSize: 50,
    search: clientSearch.trim() === '' ? undefined : clientSearch.trim(),
  })

  const form = useForm<CreateServiceOrderFormValues>({
    resolver: zodResolver(createServiceOrderSchema),
    defaultValues: {
      clientId: '',
      description: '',
      priority: 'Medium',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        clientId: values.clientId,
        description: values.description.trim(),
        priority: values.priority,
      })
      toast.success('Ordem de serviço criada.')
      navigate('/service-orders')
    } catch (err) {
      applyApiFieldErrors<CreateServiceOrderFormValues>(
        err,
        form.setError,
        apiFieldMap
      )
      if (err instanceof ApiError && !err.errors) toast.error(err.message)
      else if (!(err instanceof ApiError))
        toast.error('Não foi possível criar a ordem de serviço.')
    }
  })

  return (
    <Card className="p-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="so-client">
            Cliente
          </label>
          <Input
            id="so-client"
            placeholder="Filtrar clientes por nome ou e-mail"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
          />
          <Controller
            name="clientId"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value === '' ? undefined : field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="clientId"
                  aria-label="Selecionar cliente"
                  aria-invalid={form.formState.errors.clientId ? true : undefined}
                  onBlur={field.onBlur}
                  ref={field.ref}
                >
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(clientsQuery.data?.items ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.clientId?.message ? (
            <p className="text-xs text-danger" role="alert">
              {form.formState.errors.clientId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="priority">
            Prioridade
          </label>
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="priority" aria-label="Prioridade">
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
          <label className="text-sm font-medium text-neutral-700" htmlFor="desc">
            Descrição
          </label>
          <TextArea
            id="desc"
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
          <Button type="submit" loading={createMutation.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Card>
  )
}
