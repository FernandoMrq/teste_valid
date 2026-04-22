export const queryKeys = {
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: (params: { page: number; pageSize: number; search?: string }) =>
      [...queryKeys.clients.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.clients.all, 'detail', id] as const,
  },
  serviceOrders: {
    all: ['serviceOrders'] as const,
    summary: () => [...queryKeys.serviceOrders.all, 'summary'] as const,
    list: (params: {
      page: number
      pageSize: number
      status?: string
      priority?: string
      clientId?: string
    }) => [...queryKeys.serviceOrders.all, 'list', params] as const,
    detail: (id: string) =>
      [...queryKeys.serviceOrders.all, 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params: { page: number; pageSize: number }) =>
      [...queryKeys.notifications.all, 'list', params] as const,
  },
} as const
