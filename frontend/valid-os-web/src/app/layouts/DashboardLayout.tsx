import { NavLink, Outlet } from 'react-router-dom'

import { cn } from '../../shared/lib'
import { UserMenu } from '../../features/auth/components/UserMenu'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium text-brand-100 transition-colors outline-none',
    'hover:bg-brand-800 hover:text-white',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900',
    isActive && 'bg-brand-800 text-white'
  )

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="bg-brand-900 text-brand-50 shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/"
            className="text-lg font-semibold tracking-tight text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          >
            Valid OS
          </NavLink>
          <nav className="flex flex-1 items-center gap-1" aria-label="Principal">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/service-orders" className={navLinkClass}>
              OS
            </NavLink>
            <NavLink to="/clients" className={navLinkClass}>
              Clientes
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass}>
              Notificações
            </NavLink>
          </nav>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
