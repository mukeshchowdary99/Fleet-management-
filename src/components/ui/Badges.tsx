import type { ReactNode } from 'react'
import type { EventSeverity, TripStatus, VehicleStatus } from '../../types/domain'
import { severityMeta, tripStatusMeta, vehicleStatusMeta } from '../../utils/status'

function Dot({ className }: { className: string }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${className}`} aria-hidden="true" />
}

function BaseBadge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  )
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const meta = vehicleStatusMeta[status]
  return (
    <BaseBadge className={meta.badge}>
      <Dot className={meta.dot} />
      {meta.label}
    </BaseBadge>
  )
}

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const meta = tripStatusMeta[status]
  return (
    <BaseBadge className={meta.badge}>
      <Dot className={meta.dot} />
      {meta.label}
    </BaseBadge>
  )
}

export function SeverityBadge({ severity }: { severity: EventSeverity }) {
  const meta = severityMeta[severity]
  return (
    <BaseBadge className={meta.badge}>
      <Dot className={meta.dot} />
      {meta.label}
    </BaseBadge>
  )
}
