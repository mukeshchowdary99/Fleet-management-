import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Trip } from '../../types/domain'
import { TripStatusBadge } from '../ui/Badges'
import { SectionHeader } from '../ui/Card'
import { formatDateTime, formatDistance, formatDuration } from '../../utils/format'

export function RecentTripsTable({ trips }: { trips: Trip[] }) {
  return (
    <div className="surface overflow-hidden">
      <SectionHeader
        title="Recent trips"
        description="Newest completed and active journeys"
        className="border-b border-ink-100 px-5 py-4"
        action={
          <Link to="/trips" className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700">
            All trips <ArrowUpRight size={13} />
          </Link>
        }
      />
      {trips.length === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-ink-500">No trips recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-shell min-w-[780px]">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Route</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Started</th>
                <th>Status</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {trips.slice(0, 6).map((trip) => (
                <tr key={trip.id}>
                  <td className="font-mono text-[11px] font-medium text-brand-700">{trip.id.slice(0, 8)}</td>
                  <td>
                    <p className="text-xs font-semibold text-ink-800">{trip.registration_number}</p>
                    <p className="text-[10px] text-ink-500">{trip.driver_name ?? 'Unassigned'}</p>
                  </td>
                  <td>
                    <p className="max-w-[190px] truncate text-xs text-ink-700">{trip.start_location}</p>
                    <p className="max-w-[190px] truncate text-[10px] text-ink-500">→ {trip.end_location}</p>
                  </td>
                  <td className="tabular-nums">{formatDistance(trip.distance_km)}</td>
                  <td className="tabular-nums">{formatDuration(trip.duration_minutes)}</td>
                  <td className="whitespace-nowrap text-xs">{formatDateTime(trip.started_at)}</td>
                  <td><TripStatusBadge status={trip.status} /></td>
                  <td>
                    <Link
                      to={`/trips/${trip.id}`}
                      aria-label={`Open trip ${trip.id.slice(0, 8)}`}
                      className="inline-flex rounded p-1 text-ink-400 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <ArrowUpRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
