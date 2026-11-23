import { Check, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EventIcon } from '../common/EventIcon'
import { SeverityBadge } from '../ui/Badges'
import type { VehicleEvent } from '../../types/domain'
import { eventTypeLabels } from '../../utils/status'
import { formatDateTime, formatRelativeTime } from '../../utils/format'

export function AlertCard({
  event,
  onAcknowledge,
  acknowledging,
}: {
  event: VehicleEvent
  onAcknowledge: (id: string) => void
  acknowledging: boolean
}) {
  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-card transition ${
        event.acknowledged ? 'border-ink-200 opacity-75' : 'border-ink-200 hover:border-brand-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            event.severity === 'critical' ? 'bg-red-50 text-red-600' : event.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-ink-100 text-ink-500'
          }`}
        >
          <EventIcon type={event.event_type} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">{eventTypeLabels[event.event_type]}</h3>
            <SeverityBadge severity={event.severity} />
            {event.acknowledged && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <Check size={12} /> Acknowledged
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs leading-5 text-ink-600">{event.description}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
            <Link
              to={`/fleet?vehicle=${event.vehicle_id}`}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
            >
              {event.registration_number} <ExternalLink size={11} />
            </Link>
            <span className="truncate text-ink-400">{event.vehicle_name}</span>
            <span title={formatDateTime(event.occurred_at)}>{formatRelativeTime(event.occurred_at)}</span>
          </div>
        </div>
        {!event.acknowledged && (
          <button
            type="button"
            disabled={acknowledging}
            onClick={() => onAcknowledge(event.id)}
            className="btn-secondary shrink-0 px-2.5 py-1.5 text-[11px]"
          >
            <Check size={13} /> {acknowledging ? 'Saving…' : 'Acknowledge'}
          </button>
        )}
      </div>
    </article>
  )
}
