import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { EventIcon } from '../common/EventIcon'
import { SectionHeader } from '../ui/Card'
import type { VehicleEvent } from '../../types/domain'
import { eventTypeLabels } from '../../utils/status'
import { formatRelativeTime } from '../../utils/format'

export function ActivityFeed({ events }: { events: VehicleEvent[] }) {
  const navigate = useNavigate()

  return (
    <div className="surface flex h-full flex-col">
      <SectionHeader
        title="Recent activity"
        description="Latest recorded vehicle events"
        className="border-b border-ink-100 px-5 py-4"
        action={
          <Link to="/alerts" className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700">
            All events <ChevronRight size={13} />
          </Link>
        }
      />
      {events.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs text-ink-500">No activity recorded yet.</p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {events.slice(0, 6).map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => navigate(`/fleet?vehicle=${event.vehicle_id}`)}
                className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-brand-50/40"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                  <EventIcon type={event.event_type} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-xs font-semibold text-ink-800">{eventTypeLabels[event.event_type]}</span>
                    <span className="text-[10px] font-medium text-ink-400">{event.registration_number}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-ink-500">{event.description}</span>
                </span>
                <span className="shrink-0 whitespace-nowrap text-[10px] text-ink-400">
                  {formatRelativeTime(event.occurred_at)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
