import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Button } from '../../../shared/ui/Button'
import { PageHeader } from '../../../shared/ui/PageHeader'

import { useServiceOrderQuery } from '../api/useServiceOrderQuery'

import { ServiceOrderCreateForm } from './ServiceOrderCreateForm'
import { ServiceOrderEditForm } from './ServiceOrderEditForm'
import { ServiceOrderStatusDialog } from './ServiceOrderStatusDialog'

export function ServiceOrderForm() {
  const params = useParams<{ id?: string }>()
  const id = params.id

  if (id === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nova ordem de serviço" />
        <ServiceOrderCreateForm />
      </div>
    )
  }

  return <ServiceOrderEditView id={id} />
}

function ServiceOrderEditView({ id }: { id: string }) {
  const detailQuery = useServiceOrderQuery(id)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  if (detailQuery.isLoading) {
    return <p className="text-sm text-neutral-500">Carregando…</p>
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <p className="text-sm text-danger" role="alert">
        Não foi possível carregar a ordem de serviço.
      </p>
    )
  }

  const order = detailQuery.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar ordem de serviço"
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStatusDialogOpen(true)}
          >
            Alterar status
          </Button>
        }
      />

      <ServiceOrderEditForm order={order} />

      <ServiceOrderStatusDialog
        orderId={order.id}
        currentStatus={order.status}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onUpdated={() => void detailQuery.refetch()}
      />
    </div>
  )
}
