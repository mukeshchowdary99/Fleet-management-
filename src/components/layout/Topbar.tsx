import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronDown, ChevronRight, LogOut, Menu, Search, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { navItems, pageMetaFor } from '../../constants/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useFleetData } from '../../hooks/useFleetData'
import { useToast } from '../../hooks/useToast'
import { attentionEvents } from '../../utils/selectors'
import { getInitials } from '../../utils/format'

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { data } = useFleetData()
  const { pushToast } = useToast()
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)

  const page = pageMetaFor(location.pathname)
  const unread = data ? attentionEvents(data.events).length : 0
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Fleet user'
  const today = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
    [],
  )

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const matches = navItems.filter((item) =>
    `${item.label} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const handleLogout = async () => {
    try {
      await signOut()
      pushToast('You have been signed out.', 'success')
    } catch {
      pushToast('Could not sign out. Please try again.', 'error')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden min-w-0 shrink-0 md:block">
          <div className="flex items-center gap-1 text-[11px] font-medium text-ink-400">
            <span>Fleet operations</span>
            <ChevronRight size={12} />
            <span className="text-ink-600">{page.label}</span>
          </div>
          <p className="truncate text-sm font-semibold text-ink-900">{page.description}</p>
        </div>

        <div ref={searchRef} className="relative ml-auto w-full max-w-[260px] sm:max-w-[300px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            aria-label="Quick navigation"
            placeholder="Quick navigation…"
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setSearch(event.target.value)
              setSearchOpen(true)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matches[0]) {
                navigate(matches[0].path)
                setSearchOpen(false)
                setSearch('')
              }
            }}
            className="input-control h-9 pl-9 text-xs"
          />
          {searchOpen && (
            <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-panel">
              {matches.length === 0 ? (
                <p className="px-3 py-2.5 text-xs text-ink-500">No matching destination</p>
              ) : (
                matches.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setSearchOpen(false)
                        setSearch('')
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-ink-700 hover:bg-ink-50"
                    >
                      <Icon size={14} className="text-ink-400" />
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-auto text-[10px] text-ink-400">Go</span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-[11px] font-medium text-ink-500 xl:flex">
          {today}
        </div>

        <Link
          to="/alerts"
          aria-label={`Alerts${unread ? `, ${unread} unread` : ''}`}
          className="relative rounded-lg p-2 text-ink-600 transition hover:bg-ink-100"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div ref={userRef} className="relative">
          <button
            type="button"
            aria-label="User menu"
            aria-expanded={userOpen}
            onClick={() => setUserOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition hover:bg-ink-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
              {getInitials(fullName)}
            </span>
            <ChevronDown size={14} className="hidden text-ink-400 sm:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-panel">
              <div className="border-b border-ink-100 px-3 py-2.5">
                <p className="truncate text-xs font-semibold text-ink-900">{fullName}</p>
                <p className="truncate text-[11px] text-ink-500">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                <UserRound size={14} /> Profile & settings
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 border-t border-ink-100 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
