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
import { useCurrentUser } from '../api/useCurrentUser'
import { useAuth } from '../hooks/useAuth'

function initialsFromName(name: string | undefined): string {
  if (!name?.trim()) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  const a = parts[0]![0]
  const b = parts[parts.length - 1]![0]
  return `${a ?? ''}${b ?? ''}`.toUpperCase()
}

export function UserMenu() {
  const { logout } = useAuth()
  const { data: me, isLoading } = useCurrentUser()

  const displayName = me?.name?.trim() || me?.email || 'Conta'
  const email = me?.email
  const initials = initialsFromName(me?.name) || (email ? email[0]!.toUpperCase() : '')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-brand-50 outline-none transition-colors',
          'hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900'
        )}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-brand-50"
          aria-hidden
        >
          {isLoading ? (
            <UserRound className="h-4 w-4" />
          ) : initials ? (
            initials
          ) : (
            <UserRound className="h-4 w-4" />
          )}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 opacity-80" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        <DropdownMenuLabel className="space-y-0.5 font-normal">
          <span className="block text-sm font-medium text-neutral-900">
            {displayName}
          </span>
          {email ? (
            <span className="block truncate text-xs text-neutral-500">
              {email}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
