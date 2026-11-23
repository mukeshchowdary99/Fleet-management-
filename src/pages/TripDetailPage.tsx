import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BatteryCharging, Clock3, Fuel, Gauge, MapPin, Navigation, OctagonAlert, PauseCircle, Route as RouteIcon, UserRound } from 'lucide-react'
import { PageHeader, SectionHeader } from '../components/ui/Card'
import { TripStatusBadge, SeverityBadge } from '../components/ui/Badges'
import { FleetMap } from '../components/map/FleetMap'
import type { MapRoute } from '../components/map/FleetMap'
import { MetricCard } from '../components/dashboard/MetricCard'
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States'
import { EventIcon } from '../components/common/EventIcon'
import { useFleetData } from '../hooks/useFleetData'
import { locationsForTrip, vehicleById } from '../utils/selectors'
import { eventTypeLabels } from '../utils/status'
import { formatCoordinate, formatDateTime, formatDistance, formatDuration, formatSpeed } from '../utils/format'

export function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data, loading, error, refresh } = useFleetData()
  const [fitCounter, setFitCounter] = useState(0)

  const route: MapRoute = useMemo(() => {
    const trip = data?.trips.find((item) => item.id === tripId)
    if (!trip) return { points: [], history: [] }
    const points = (data?.locations ?? [])
      .filter((point) => point.trip_id === trip.id)
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .map((point) => ({ latitude: point.latitude, longitude: point.longitude }))
    return {
      points,
      start: { latitude: trip.start_latitude, longitude: trip.start_longitude },
      end: { latitude: trip.end_latitude, longitude: trip.end_longitude },
      history: points,
    }
  }, [data, tripId])

  if (error && !data) return <div className="surface"><ErrorState message={error} onRetry={() => void refresh()} /></div>
  if (!data || loading) return <div className="surface"><LoadingBlock rows={6} /></div>

  const trip = data.trips.find((item) => item.id === tripId)
  if (!trip) {
    return (
      <div className="surface">
        <EmptyState
          title="Trip not found"
          description="This trip is not present in the current data snapshot."
          action={<Link to="/trips" className="btn-secondary">Back to trips</Link>}
        />
      </div>
    )
  }

  const vehicle = vehicleById(data, trip.vehicle_id)
  const points = locationsForTrip(data, trip.id)
  const events = data.events.filter((event) => event.trip_id === trip.id || event.vehicle_id === trip.vehicle_id).slice(0, 8)
  return (
    <div className="space-y-5">
      <Link to="/trips" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand-600">
        <ArrowLeft size={14} /> Back to trips
      </Link>

      <PageHeader
        title={`Trip ${trip.id.slice(0, 8)}`}
        description={`${trip.start_location} → ${trip.end_location}`}
        action={<TripStatusBadge status={trip.status} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Distance" value={formatDistance(trip.distance_km)} icon={RouteIcon} />
        <MetricCard label="Duration" value={formatDuration(trip.duration_minutes)} icon={Clock3} tone="amber" />
        <MetricCard label="Avg speed" value={formatSpeed(trip.average_speed)} icon={Gauge} />
        <MetricCard label="Max speed" value={formatSpeed(trip.maximum_speed)} icon={Gauge} tone="red" />
        <MetricCard label="Idle time" value={`${trip.idle_minutes} min`} icon={PauseCircle} tone="amber" />
        <MetricCard label="Halts" value={trip.halt_count} hint={`${trip.overspeed_events} overspeed events`} icon={OctagonAlert} tone="red" />
      </div>

      <div className="surface overflow-hidden">
        <SectionHeader
          title="Route inspection"
          description={`${points.length} historical location points · start and destination markers shown`}
          className="border-b border-ink-100 px-5 py-4"
          action={
            <button type="button" onClick={() => setFitCounter((count) => count + 1)} className="btn-secondary py-1.5 text-xs">
              <Navigation size={13} /> Fit route
            </button>
          }
        />
        <FleetMap
          showVehicles={false}
          route={route}
          fitSignal={`trip-${trip.id}-${fitCounter}`}
          className="h-[360px] rounded-none border-0 sm:h-[440px]"
        />
        <div className="grid gap-4 border-t border-ink-100 px-5 py-4 sm:grid-cols-2">
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><MapPin size={14} /></span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Starting point</p>
              <p className="text-xs font-semibold text-ink-900">{trip.start_location}</p>
              <p className="font-mono text-[10px] text-ink-500">{formatCoordinate(trip.start_latitude, trip.start_longitude)}</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"><MapPin size={14} /></span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Destination</p>
              <p className="text-xs font-semibold text-ink-900">{trip.end_location}</p>
              <p className="font-mono text-[10px] text-ink-500">{formatCoordinate(trip.end_latitude, trip.end_longitude)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface">
          <SectionHeader title="Vehicle & driver" description="Assignment for this trip" className="border-b border-ink-100 px-5 py-4" />
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><RouteIcon size={16} /></span>
              <div>
                <p className="text-xs font-semibold text-ink-900">{vehicle?.registration_number ?? trip.registration_number}</p>
                <p className="text-[10px] text-ink-500">{vehicle?.vehicle_name ?? 'Vehicle record unavailable'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><UserRound size={16} /></span>
              <div>
                <p className="text-xs font-semibold text-ink-900">{trip.driver_name ?? 'Unassigned'}</p>
                <p className="text-[10px] text-ink-500">Assigned driver</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-ink-50 p-3">
                <p className="flex items-center gap-1.5 text-[10px] text-ink-500"><Fuel size={12} /> Fuel level</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{vehicle ? `${Math.round(vehicle.fuel_level)}%` : '—'}</p>
              </div>
              <div className="rounded-lg bg-ink-50 p-3">
                <p className="flex items-center gap-1.5 text-[10px] text-ink-500"><BatteryCharging size={12} /> Battery</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{vehicle ? `${Math.round(vehicle.battery_level)}%` : '—'}</p>
              </div>
            </div>
            <div className="rounded-lg border border-ink-200 p-3 text-[11px] text-ink-600">
              <p><span className="text-ink-400">Started </span>{formatDateTime(trip.started_at)}</p>
              <p className="mt-1"><span className="text-ink-400">Ended </span>{formatDateTime(trip.ended_at)}</p>
            </div>
          </div>
        </div>

        <div className="surface">
          <SectionHeader title="Recorded locations" description="Chronological historical points" className="border-b border-ink-100 px-5 py-4" />
          {points.length === 0 ? (
            <EmptyState title="No location points" description="This trip has no persisted location history." />
          ) : (
            <ol className="max-h-[330px] space-y-2 overflow-y-auto p-5">
              {points.map((point, index) => (
                <li key={point.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-ink-50/70 px-3 py-2 text-[11px]">
                  <span className="text-ink-400">#{index + 1}</span>
                  <span className="font-mono text-ink-800">{formatCoordinate(point.latitude, point.longitude)}</span>
                  <span className="text-ink-600">{formatSpeed(point.speed)}</span>
                  <span className="text-ink-400">{formatDateTime(point.recorded_at)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="surface">
        <SectionHeader title="Related events" description="Vehicle events around this trip" className="border-b border-ink-100 px-5 py-4" />
        {events.length === 0 ? (
          <EmptyState title="No related events" description="No persisted events are linked to this vehicle or trip." />
        ) : (
          <ul className="divide-y divide-ink-100">
            {events.map((event) => (
              <li key={event.id} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                  <EventIcon type={event.event_type} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-ink-800">{eventTypeLabels[event.event_type]}</p>
                    <SeverityBadge severity={event.severity} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-600">{event.description}</p>
                </div>
                <span className="whitespace-nowrap text-[10px] text-ink-400">{formatDateTime(event.occurred_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
