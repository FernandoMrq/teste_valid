export {
  createClient,
  getClientById,
  listClients,
  type CreateClientBody,
  type ListClientsParams,
} from './api/clientsApi'
export { useClientByIdQuery } from './api/useClientByIdQuery'
export { useClientsQuery } from './api/useClientsQuery'
export { useCreateClientMutation } from './api/useCreateClientMutation'
export { ClientForm } from './components/ClientForm'
export { ClientList } from './components/ClientList'
export { ClientListItem } from './components/ClientListItem'
export { clientFormSchema, type ClientFormValues } from './schemas/clientSchema'
export type {
  ClientDetailsDto,
  ClientDto,
  DocumentType,
  PagedResult,
} from './types'
