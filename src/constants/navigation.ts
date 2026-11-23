import type { LucideIcon } from 'lucide-react'
import { BellRing, LayoutDashboard, MapPinned, Route, Settings2, Truck } from 'lucide-react'

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
  description: string
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, description: 'Fleet status and recent activity' },
  { label: 'Fleet', path: '/fleet', icon: Truck, description: 'Vehicles, drivers and health' },
  { label: 'Live Tracking', path: '/tracking', icon: MapPinned, description: 'Historical locations and routes' },
  { label: 'Trips', path: '/trips', icon: Route, description: 'Trip history and performance' },
  { label: 'Alerts', path: '/alerts', icon: BellRing, description: 'Operational issues requiring review' },
  { label: 'Settings', path: '/settings', icon: Settings2, description: 'Profile and account details' },
]

export function pageMetaFor(pathname: string): NavItem {
  return navItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`)) ?? navItems[0]
}
