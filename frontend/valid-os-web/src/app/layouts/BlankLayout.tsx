import { Outlet } from 'react-router-dom'

export function BlankLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <Outlet />
    </div>
  )
}
