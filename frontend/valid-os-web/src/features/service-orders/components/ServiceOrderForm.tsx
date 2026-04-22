import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiError } from '../../../shared/api/apiError'
import { applyApiFieldErrors } from '../../../shared/lib/applyApiFieldErrors'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { PageHeader } from '../../../shared/ui/PageHeader'
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
import { useServiceOrderQuery } from '../api/useServiceOrderQuery'
import { useUpdateServiceOrderMutation } from '../api/useUpdateServiceOrderMutation'
import { useUpdateStatusMutation } from '../api/useUpdateStatusMutation'
import {
  createServiceOrderSchema,
  type CreateServiceOrderFormValues,
} from '../schemas/createServiceOrderSchema'
import {
  updateServiceOrderSchema,
  type UpdateServiceOrderFormValues,
} from '../schemas/updateServiceOrderSchema'
import type { Priority, ServiceOrderStatus } from '../types'

const createFieldMap: Record<string, keyof CreateServiceOrderFormValues> = {
  ClientId: 'clientId',
  Description: 'description',
  Priority: 'priority',
}

const updateFieldMap: Record<string, keyof UpdateServiceOrderFormValues> = {
  Description: 'description',
  Priority: 'priority',
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'Low', label: 'Baixa' },
  { value: 'Medium', label: 'Média' },
  { value: 'High', label: 'Alta' },
  { value: 'Critical', label: 'Crítica' },
]

const statusOptions: { value: ServiceOrderStatus; label: string }[] = [
  { value: 'Open', label: 'Aberta' },
  { value: 'InProgress', label: 'Em andamento' },
  { value: 'AwaitingCustomer', label: 'Aguardando cliente' },
  { value: 'Resolved', label: 'Resolvida' },
  { value: 'Closed', label: 'Encerrada' },
]

export function ServiceOrderForm() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const id = params.id
  const isCreate = id === undefined

  const detailQuery = useServiceOrderQuery(id)
  const createMutation = useCreateServiceOrderMutation()
  const updateMutation = useUpdateServiceOrderMutation()
  const updateStatusMutation = useUpdateStatusMutation()

  const [clientSearch, setClientSearch] = useState('')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<ServiceOrderStatus>('Open')
  const syncedEditOrderIdRef = useRef<string | undefined>(undefined)

  const clientsQuery = useClientsQuery({
    page: 1,
    pageSize: 50,
    search: clientSearch.trim() === '' ? undefined : clientSearch.trim(),
  })

  const createForm = useForm<CreateServiceOrderFormValues>({
    resolver: zodResolver(createServiceOrderSchema),
    defaultValues: {
      clientId: '',
      description: '',
      priority: 'Medium',
    },
  })

  const editForm = useForm<UpdateServiceOrderFormValues>({
    resolver: zodResolver(updateServiceOrderSchema),
    defaultValues: {
      description: '',
      priority: 'Medium',
    },
  })

  const { isDirty: editIsDirty, isValid: editIsValid } = editForm.formState

  useEffect(() => {
    const d = detailQuery.data
    if (!d || isCreate || d.id !== id) return

    if (syncedEditOrderIdRef.current !== id) {
      syncedEditOrderIdRef.current = id
      editForm.reset({
        description: d.description,
        priority: d.priority,
      })
    } else if (!editForm.formState.isDirty) {
      editForm.reset({
        description: d.description,
        priority: d.priority,
      })
    }

    setNextStatus(d.status)
  }, [detailQuery.data, id, isCreate, editForm])

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
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
        createForm.setError,
        createFieldMap
      )
      if (err instanceof ApiError && !err.errors) toast.error(err.message)
      else if (!(err instanceof ApiError))
        toast.error('Não foi possível criar a ordem de serviço.')
    }
  })

  const onEditSubmit = editForm.handleSubmit(async (values) => {
    if (!id) return
    try {
      await updateMutation.mutateAsync({
        id,
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
        editForm.setError,
        updateFieldMap
      )
      if (err instanceof ApiError && !err.errors) toast.error(err.message)
      else if (!(err instanceof ApiError))
        toast.error('Não foi possível atualizar a ordem de serviço.')
    }
  })

  const onConfirmStatus = async () => {
    if (!id) return
    try {
      await updateStatusMutation.mutateAsync({ id, status: nextStatus })
      toast.success('Status atualizado.')
      setStatusDialogOpen(false)
      detailQuery.refetch()
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message)
      else toast.error('Não foi possível alterar o status.')
    }
  }

  if (!isCreate && detailQuery.isLoading) {
    return <p className="text-sm text-neutral-500">Carregando…</p>
  }

  if (!isCreate && detailQuery.isError) {
    return (
      <p className="text-sm text-danger" role="alert">
        Não foi possível carregar a ordem de serviço.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCreate ? 'Nova ordem de serviço' : 'Editar ordem de serviço'}
        actions={
          !isCreate && detailQuery.data ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setNextStatus(detailQuery.data.status)
                setStatusDialogOpen(true)
              }}
            >
              Alterar status
            </Button>
          ) : null
        }
      />

      {isCreate ? (
        <Card className="p-6">
          <form className="space-y-4" onSubmit={onCreateSubmit}>
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
                control={createForm.control}
                render={({ field }) => (
                  <Select
                    value={field.value === '' ? undefined : field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="clientId"
                      aria-label="Selecionar cliente"
                      aria-invalid={createForm.formState.errors.clientId ? true : undefined}
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
              {createForm.formState.errors.clientId?.message ? (
                <p className="text-xs text-danger" role="alert">
                  {createForm.formState.errors.clientId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="priority">
                Prioridade
              </label>
              <Controller
                name="priority"
                control={createForm.control}
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
                error={createForm.formState.errors.description?.message}
                {...createForm.register('description')}
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
      ) : (
        detailQuery.data && (
          <Card className="p-6">
            <div className="mb-4 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              Cliente:{' '}
              <span className="font-medium">{detailQuery.data.client.name}</span>
              <span className="text-neutral-500"> ({detailQuery.data.client.email})</span>
            </div>
            <form className="space-y-4" onSubmit={onEditSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700" htmlFor="epriority">
                  Prioridade
                </label>
                <Controller
                  name="priority"
                  control={editForm.control}
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
                  error={editForm.formState.errors.description?.message}
                  {...editForm.register('description')}
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
                  disabled={!editIsDirty || !editIsValid}
                >
                  Salvar
                </Button>
              </div>
            </form>
          </Card>
        )
      )}

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Alterar status</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="next-status">
              Novo status
            </label>
            <Select
              value={nextStatus}
              onValueChange={(v) => setNextStatus(v as ServiceOrderStatus)}
            >
              <SelectTrigger id="next-status" aria-label="Novo status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              loading={updateStatusMutation.isPending}
              onClick={() => void onConfirmStatus()}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
