export type DocumentType = 'Cpf' | 'Cnpj'

export type ClientDto = {
  id: string
  name: string
  email: string
  documentType: DocumentType | null
  documentValue: string | null
  createdAt: string
}

export type PagedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}
