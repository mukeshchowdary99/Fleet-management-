import { ArrowUpRight, BellRing, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFleetData } from '../../hooks/useFleetData'
import type { VehicleEvent } from '../../types/domain'
import { SeverityBadge } from '../ui/Badges'
import { SectionHeader } from '../ui/Card'
import { EventIcon } from '../common/EventIcon'
import { eventTypeLabels } from '../../utils/status'
import { formatRelativeTime } from '../../utils/format'

export function AttentionPanel({ events }: { events: VehicleEvent[] }) {
  const { acknowledge, acknowledging } = useFleetData()

  return (
    <div className="surface flex h-full flex-col">
      <SectionHeader
        title="Needs attention"
        description={`${events.length} open operational ${events.length === 1 ? 'issue' : 'issues'}`}
        className="border-b border-ink-100 px-5 py-4"
        action={
          <Link to="/alerts" className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700">
            View all <ArrowUpRight size={13} />
          </Link>
        }
      />
      {events.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check size={17} />
          </span>
          <p className="text-xs font-semibold text-ink-800">All clear</p>
          <p className="mt-1 text-[11px] text-ink-500">No unacknowledged operational issues.</p>
        </div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {events.slice(0, 5).map((event) => (
            <li key={event.id} className="px-5 py-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <EventIcon type={event.event_type} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-ink-800">{eventTypeLabels[event.event_type]}</p>
                    <SeverityBadge severity={event.severity} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-ink-600">{event.description}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-ink-400">
                    <span className="font-medium text-ink-600">{event.registration_number}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(event.occurred_at)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Acknowledge ${eventTypeLabels[event.event_type]} alert`}
                  title="Acknowledge"
                  disabled={acknowledging === event.id}
                  onClick={() => void acknowledge(event.id)}
                  className="shrink-0 rounded-lg border border-ink-200 p-1.5 text-ink-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
                >
                  {acknowledging === event.id ? <BellRing size={13} className="animate-pulse" /> : <Check size={13} />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
