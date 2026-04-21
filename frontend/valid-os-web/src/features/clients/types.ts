export type DocumentType = 'Cpf' | 'Cnpj'

export type ClientDto = {
  id: string
  name: string
  email: string
  documentType: DocumentType | null
  documentValue: string | null
  createdAt: string
}

/** Alias for respostas de detalhe (mesmo shape que `ClientDto`). */
export type ClientDetailsDto = ClientDto

export type PagedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}
