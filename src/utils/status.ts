import type { EventSeverity, EventType, TripStatus, VehicleStatus } from '../types/domain'

type StatusMeta = {
  label: string
  hex: string
  dot: string
  badge: string
}

export const vehicleStatusMeta: Record<VehicleStatus, StatusMeta> = {
  moving: {
    label: 'Moving',
    hex: '#10b981',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  idle: {
    label: 'Idle',
    hex: '#f59e0b',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  offline: {
    label: 'Offline',
    hex: '#94a3b8',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  },
  attention: {
    label: 'Needs attention',
    hex: '#ef4444',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 ring-red-600/20',
  },
}

export const tripStatusMeta: Record<TripStatus, StatusMeta> = {
  completed: {
    label: 'Completed',
    hex: '#10b981',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  in_progress: {
    label: 'In progress',
    hex: '#3267f6',
    dot: 'bg-brand-500',
    badge: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  },
  cancelled: {
    label: 'Cancelled',
    hex: '#94a3b8',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  },
}

export const severityMeta: Record<EventSeverity, StatusMeta> = {
  info: {
    label: 'Info',
    hex: '#64748b',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  },
  warning: {
    label: 'Warning',
    hex: '#f59e0b',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  critical: {
    label: 'Critical',
    hex: '#ef4444',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 ring-red-600/20',
  },
}

export const eventTypeLabels: Record<EventType, string> = {
  trip_started: 'Trip started',
  trip_completed: 'Trip completed',
  vehicle_stopped: 'Vehicle stopped',
  vehicle_resumed: 'Vehicle resumed',
  overspeed_detected: 'Overspeed detected',
  ignition_on: 'Ignition on',
  ignition_off: 'Ignition off',
  went_offline: 'Vehicle offline',
  low_fuel: 'Low fuel',
  low_battery: 'Low battery',
  long_idle: 'Long idle',
}

export const isAttentionEvent = (type: EventType): boolean =>
  type === 'overspeed_detected' || type === 'low_fuel' || type === 'low_battery' ||
  type === 'went_offline' || type === 'long_idle'

export const vehicleStatuses: VehicleStatus[] = ['moving', 'idle', 'offline', 'attention']
export const tripStatuses: TripStatus[] = ['completed', 'in_progress', 'cancelled']
export const severities: EventSeverity[] = ['critical', 'warning', 'info']
