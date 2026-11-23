import { useCallback } from 'react'
import { LogOut, Truck, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from '../../constants/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getInitials } from '../../utils/format'

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth()
  const { pushToast } = useToast()
  const fullName = user?.user_metadata?.full_name as string | undefined

  const handleLogout = useCallback(async () => {
    try {
      await signOut()
      pushToast('You have been signed out.', 'success')
      onClose()
    } catch {
      pushToast('Could not sign out. Please try again.', 'error')
    }
  }, [signOut, pushToast, onClose])

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-ink-950 text-ink-300 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Truck size={17} strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-white">FleetOps</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">Operations</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded p-1 text-ink-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Main navigation">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-600">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-500/15 text-white ring-1 ring-inset ring-brand-400/30'
                      : 'text-ink-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={isActive ? 'text-brand-300' : 'text-ink-500 group-hover:text-ink-300'} />
                    {item.label}
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[11px] font-bold text-brand-200">
              {getInitials(fullName || user?.email || 'Fleet user')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{fullName || user?.email?.split('@')[0] || 'Fleet user'}</p>
              <p className="truncate text-[10px] text-ink-500">Operations team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
