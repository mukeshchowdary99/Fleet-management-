import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock3, Fuel, Gauge, MapPin, Power, UserRound } from 'lucide-react'
import { Drawer } from '../ui/Drawer'
import { VehicleStatusBadge, TripStatusBadge, SeverityBadge } from '../ui/Badges'
import { ProgressBar } from '../ui/ProgressBar'
import { EmptyState } from '../ui/States'
import { FleetMap } from '../map/FleetMap'
import { EventIcon } from '../common/EventIcon'
import { useFleetData } from '../../hooks/useFleetData'
import { locationsForVehicle, eventsForVehicle, tripsForVehicle, vehicleById } from '../../utils/selectors'
import { eventTypeLabels } from '../../utils/status'
import { formatCoordinate, formatDateTime, formatDistance, formatDuration, formatPercent, formatRelativeTime, formatSpeed } from '../../utils/format'

type Tab = 'overview' | 'trips' | 'events' | 'history'

const tabs: Array<{ key: Tab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'trips', label: 'Trips' },
  { key: 'events', label: 'Events' },
  { key: 'history', label: 'Movement' },
]

function InfoTile({ icon: Icon, label, value, sub }: { icon: typeof Fuel; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3">
      <div className="flex items-center gap-2 text-ink-500">
        <Icon size={14} />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-ink-900">{value}</p>
      {sub && <p className="mt-0.5 truncate text-[10px] text-ink-500">{sub}</p>}
    </div>
  )
}

export function VehicleDetailDrawer({ vehicleId, onClose }: { vehicleId: string | null; onClose: () => void }) {
  const { data } = useFleetData()
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => setTab('overview'), [vehicleId])

  const vehicle = vehicleId ? vehicleById(data ?? { vehicles: [], trips: [], events: [], latestLocations: [], locations: [] }, vehicleId) : undefined
  const open = Boolean(vehicleId && vehicle)

  if (!vehicle || !data) {
    return (
      <Drawer open={Boolean(vehicleId)} onClose={onClose} title="Vehicle details">
        <EmptyState title="Vehicle not found" description="This vehicle is no longer available in the current data snapshot." />
      </Drawer>
    )
  }

  const location = data.latestLocations.find((item) => item.vehicle_id === vehicle.id)
  const trips = tripsForVehicle(data, vehicle.id)
  const events = eventsForVehicle(data, vehicle.id)
  const history = locationsForVehicle(data, vehicle.id)

  return (
    <Drawer open={open} onClose={onClose} title={vehicle.registration_number} subtitle={vehicle.vehicle_name}>
      <div className="border-b border-ink-100 px-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 py-4">
          <VehicleStatusBadge status={vehicle.status} />
          <span className="text-xs text-ink-600">{vehicle.vehicle_type} · {vehicle.manufacturer} {vehicle.model}</span>
        </div>
        <div className="flex gap-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${
                tab === item.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoTile icon={UserRound} label="Driver" value={vehicle.driver_name ?? 'Unassigned'} sub={vehicle.ignition_state ? 'Ignition on' : 'Ignition off'} />
              <InfoTile icon={Clock3} label="Last seen" value={formatRelativeTime(vehicle.last_seen_at)} sub={formatDateTime(vehicle.last_seen_at)} />
              <InfoTile icon={MapPin} label="Last position" value={location ? formatCoordinate(location.latitude, location.longitude) : '—'} sub={location ? formatRelativeTime(location.recorded_at) : undefined} />
              <InfoTile icon={Gauge} label="Speed" value={location ? formatSpeed(location.speed) : '—'} sub={location?.trip_id ? 'During recorded trip' : 'No active trip'} />
              <InfoTile icon={Power} label="Ignition" value={vehicle.ignition_state ? 'On' : 'Off'} sub="Latest vehicle state" />
              <InfoTile icon={Fuel} label="Fuel" value={formatPercent(vehicle.fuel_level)} sub="Persisted vehicle reading" />
            </div>

            <div className="rounded-xl border border-ink-200 p-4">
              <ProgressBar value={vehicle.fuel_level} tone="fuel" label="Fuel level" />
              <div className="mt-4"><ProgressBar value={vehicle.battery_level} tone="battery" label="Battery level" /></div>
            </div>

            <FleetMap
              vehicles={[vehicle]}
              locations={location ? [location] : []}
              trips={trips}
              selectedVehicleId={vehicle.id}
              fitSignal={`vehicle-${vehicle.id}`}
              className="h-[240px]"
            />

            <Link
              to={`/tracking?vehicle=${vehicle.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Inspect on tracking map <ArrowUpRight size={13} />
            </Link>
          </>
        )}

        {tab === 'trips' && (
          <div className="space-y-2">
            {trips.length === 0 ? (
              <EmptyState title="No trips yet" description="No recorded trips for this vehicle." />
            ) : (
              trips.slice(0, 12).map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="block rounded-lg border border-ink-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-ink-900">{trip.start_location} → {trip.end_location}</p>
                      <p className="mt-0.5 text-[10px] text-ink-500">{formatDateTime(trip.started_at)} · {trip.id.slice(0, 8)}</p>
                    </div>
                    <TripStatusBadge status={trip.status} />
                  </div>
                  <div className="mt-2 flex gap-4 text-[11px] text-ink-600">
                    <span>{formatDistance(trip.distance_km)}</span>
                    <span>{formatDuration(trip.duration_minutes)}</span>
                    <span>{formatSpeed(trip.average_speed)} avg</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-2">
            {events.length === 0 ? (
              <EmptyState title="No events" description="No recorded events for this vehicle." />
            ) : (
              events.slice(0, 20).map((event) => (
                <div key={event.id} className="rounded-lg border border-ink-200 p-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                      <EventIcon type={event.event_type} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold text-ink-900">{eventTypeLabels[event.event_type]}</p>
                        <SeverityBadge severity={event.severity} />
                        {event.acknowledged && <span className="text-[10px] font-medium text-emerald-600">Acknowledged</span>}
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-ink-600">{event.description}</p>
                      <p className="mt-1 text-[10px] text-ink-400">{formatDateTime(event.occurred_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            <p className="mb-3 text-[11px] text-ink-500">Most recent recorded positions first. Historical sample data.</p>
            {history.length === 0 ? (
              <EmptyState title="No movement history" description="No persisted location points for this vehicle." />
            ) : (
              <ol className="relative space-y-3 border-l border-ink-200 pl-5">
                {history.slice(0, 24).map((point) => (
                  <li key={point.id} className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px] text-ink-800">{formatCoordinate(point.latitude, point.longitude)}</span>
                      <span className="text-[10px] text-ink-400">{formatDateTime(point.recorded_at)}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-ink-500">
                      {formatSpeed(point.speed)} · ignition {point.ignition_state ? 'on' : 'off'}
                      {point.trip_id ? ` · trip ${point.trip_id.slice(0, 8)}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </Drawer>
  )
}
