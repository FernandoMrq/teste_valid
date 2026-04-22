import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiError } from '../../../shared/api/apiError'
import { formatDate } from '../../../shared/lib'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { PageHeader } from '../../../shared/ui/PageHeader'

import { useClientByIdQuery } from '../api/useClientByIdQuery'
import { useCreateClientMutation } from '../api/useCreateClientMutation'
import { applyApiFieldErrors } from '../../../shared/lib/applyApiFieldErrors'
import {
  clientFormSchema,
  type ClientFormValues,
} from '../schemas/clientSchema'

const apiFieldMapping: Record<string, keyof ClientFormValues> = {
  Name: 'name',
  Email: 'email',
  DocumentValue: 'documentValue',
}

type Props =
  | { variant: 'create' }
  | { variant: 'detail'; clientId: string }

export function ClientForm(props: Props) {
  const navigate = useNavigate()
  const createMutation = useCreateClientMutation()

  const clientId = props.variant === 'detail' ? props.clientId : undefined
  const detailQuery = useClientByIdQuery(clientId)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      documentValue: '',
    },
  })

  useEffect(() => {
    if (!detailQuery.data) return
    reset({
      name: detailQuery.data.name,
      email: detailQuery.data.email,
      documentValue: detailQuery.data.documentValue ?? '',
    })
  }, [detailQuery.data, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (props.variant === 'detail') return

    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim(),
        documentValue:
          values.documentValue?.trim() === ''
            ? undefined
            : values.documentValue?.trim(),
      })
      toast.success('Cliente cadastrado.')
      navigate('/clients')
    } catch (err) {
      applyApiFieldErrors<ClientFormValues>(err, setError, apiFieldMapping)
      if (err instanceof ApiError && !err.errors) {
        toast.error(err.message)
      } else if (!(err instanceof ApiError)) {
        toast.error('Não foi possível salvar o cliente.')
      }
    }
  })

  const isDetail = props.variant === 'detail'
  const loadingDetail = isDetail && detailQuery.isLoading

  return (
    <div className="space-y-6">
      <PageHeader title={isDetail ? 'Cliente' : 'Novo cliente'} />

      <Card className="p-6">
        {loadingDetail ? (
          <p className="text-sm text-neutral-500">Carregando…</p>
        ) : isDetail && detailQuery.isError ? (
          <p className="text-sm text-danger" role="alert">
            Não foi possível carregar o cliente.
          </p>
        ) : (
          <form id="client-form" className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="name">
                Nome
              </label>
              <Input
                id="name"
                autoComplete="organization"
                disabled={isDetail}
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="email">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isDetail}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-neutral-700"
                htmlFor="documentValue"
              >
                Documento (CPF/CNPJ)
              </label>
              <Input
                id="documentValue"
                autoComplete="off"
                disabled={isDetail}
                error={errors.documentValue?.message}
                {...register('documentValue')}
              />
            </div>

            {isDetail && detailQuery.data ? (
              <p className="text-xs text-neutral-500">
                Cadastrado em {formatDate(detailQuery.data.createdAt)}
              </p>
            ) : null}

            {!isDetail ? (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/clients')}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={createMutation.isPending}>
                  Salvar
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/clients')}
                >
                  Voltar
                </Button>
              </div>
            )}
          </form>
        )}
      </Card>
    </div>
  )
}
