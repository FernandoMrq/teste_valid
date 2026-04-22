import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ApiError } from '../../../shared/api/apiError'
import { Button } from '../../../shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'

import { useUpdateStatusMutation } from '../api/useUpdateStatusMutation'
import type { ServiceOrderStatus } from '../types'

import { statusOptions } from './serviceOrderOptions'

type Props = {
  orderId: string
  currentStatus: ServiceOrderStatus
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export function ServiceOrderStatusDialog({
  orderId,
  currentStatus,
  open,
  onOpenChange,
  onUpdated,
}: Props) {
  const [nextStatus, setNextStatus] = useState<ServiceOrderStatus>(currentStatus)
  const updateStatusMutation = useUpdateStatusMutation()

  useEffect(() => {
    if (open) {
      setNextStatus(currentStatus)
    }
  }, [open, currentStatus])

  const onConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: nextStatus })
      toast.success('Status atualizado.')
      onOpenChange(false)
      onUpdated?.()
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message)
      else toast.error('Não foi possível alterar o status.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            loading={updateStatusMutation.isPending}
            onClick={() => void onConfirm()}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
