import type { Priority, ServiceOrderStatus } from '../types'

export const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'Low', label: 'Baixa' },
  { value: 'Medium', label: 'Média' },
  { value: 'High', label: 'Alta' },
  { value: 'Critical', label: 'Crítica' },
]

export const statusOptions: { value: ServiceOrderStatus; label: string }[] = [
  { value: 'Open', label: 'Aberta' },
  { value: 'InProgress', label: 'Em andamento' },
  { value: 'AwaitingCustomer', label: 'Aguardando cliente' },
  { value: 'Resolved', label: 'Resolvida' },
  { value: 'Closed', label: 'Encerrada' },
]
