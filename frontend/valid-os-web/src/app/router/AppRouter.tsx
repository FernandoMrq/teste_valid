import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute'
import { DashboardLayout } from '../layouts/DashboardLayout'

const DashboardPage = lazy(() => import('../../pages/DashboardPage'))
const ServiceOrderListPage = lazy(
  () => import('../../pages/ServiceOrderListPage')
)
const ServiceOrderFormPage = lazy(
  () => import('../../pages/ServiceOrderFormPage')
)
const ServiceOrderDetailsPage = lazy(
  () => import('../../pages/ServiceOrderDetailsPage')
)
const ClientListPage = lazy(() => import('../../pages/ClientListPage'))
const ClientFormPage = lazy(() => import('../../pages/ClientFormPage'))
const NotificationsPage = lazy(() => import('../../pages/NotificationsPage'))
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage'))

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="service-orders" element={<ServiceOrderListPage />} />
          <Route path="service-orders/new" element={<ServiceOrderFormPage />} />
          <Route
            path="service-orders/:id/details"
            element={<ServiceOrderDetailsPage />}
          />
          <Route path="service-orders/:id" element={<ServiceOrderFormPage />} />
          <Route path="clients" element={<ClientListPage />} />
          <Route path="clients/new" element={<ClientFormPage />} />
          <Route path="clients/:id" element={<ClientFormPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
