import { ChevronDown, LogOut, UserRound } from 'lucide-react'

import { cn } from '../../../shared/lib'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/Dropdown'
import { useAuth } from '../hooks/useAuth'

function displayName(
  user: ReturnType<typeof useAuth>['user']
): string | undefined {
  if (!user || typeof user !== 'object') return undefined
  const u = user as Record<string, unknown>
  const name = u.name
  const preferred = u.preferred_username
  const email = u.email
  if (typeof name === 'string' && name.length > 0) return name
  if (typeof preferred === 'string' && preferred.length > 0)
    return preferred
  if (typeof email === 'string' && email.length > 0) return email
  return undefined
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const label = displayName(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-brand-50 outline-none transition-colors',
          'hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900'
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-brand-50">
          <UserRound className="h-4 w-4" aria-hidden />
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {label ?? 'Conta'}
        </span>
        <ChevronDown className="h-4 w-4 opacity-80" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        {label ? (
          <>
            <DropdownMenuLabel className="font-normal text-neutral-700">
              {label}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-danger focus:text-danger"
          onSelect={() => {
            logout()
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
