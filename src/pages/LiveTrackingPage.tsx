import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Crosshair, Info, MapPin, Navigation, Route as RouteIcon } from 'lucide-react'
import { PageHeader } from '../components/ui/Card'
import { SearchInput, SelectField } from '../components/ui/Fields'
import { VehicleStatusBadge } from '../components/ui/Badges'
import { FleetMap } from '../components/map/FleetMap'
import type { MapRoute } from '../components/map/FleetMap'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States'
import { useFleetData } from '../hooks/useFleetData'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { locationsForTrip, locationsForVehicle, tripsForVehicle, vehicleById } from '../utils/selectors'
import { vehicleStatuses } from '../utils/status'
import { formatCoordinate, formatDateTime, formatDistance, formatDuration, formatRelativeTime, formatSpeed, humanize } from '../utils/format'
import type { VehicleStatus } from '../types/domain'

export function LiveTrackingPage() {
  const { data, loading, error, refresh } = useFleetData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<VehicleStatus | 'all'>('all')
  const [fitCounter, setFitCounter] = useState(0)
  const debouncedSearch = useDebouncedValue(search)

  const selectedVehicleId = searchParams.get('vehicle')
  const selectedTripId = searchParams.get('trip')

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      })
    },
    [setSearchParams],
  )

  const selectVehicle = useCallback(
    (id: string) => {
      setParam('vehicle', id)
      setParam('trip', null)
    },
    [setParam],
  )

  const route: MapRoute | null = useMemo(() => {
    if (!data || !selectedTripId) return null
    const trip = data.trips.find((item) => item.id === selectedTripId)
    if (!trip) return null
    const points = data.locations
      .filter((point) => point.trip_id === trip.id)
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .map((point) => ({ latitude: point.latitude, longitude: point.longitude }))
    return {
      points,
      start: { latitude: trip.start_latitude, longitude: trip.start_longitude },
      end: { latitude: trip.end_latitude, longitude: trip.end_longitude },
      history: points,
    }
  }, [data, selectedTripId])

  if (error && !data) return <div className="surface"><ErrorState message={error} onRetry={() => void refresh()} /></div>
  if (!data || loading) return <div className="surface"><LoadingBlock rows={8} /></div>

  const filteredVehicles = data.vehicles.filter((vehicle) => {
    const term = debouncedSearch.trim().toLowerCase()
    return (
      (!term || `${vehicle.registration_number} ${vehicle.vehicle_name}`.toLowerCase().includes(term)) &&
      (status === 'all' || vehicle.status === status)
    )
  })

  const selected = vehicleById(data, selectedVehicleId)
  const selectedLocation = data.latestLocations.find((item) => item.vehicle_id === selectedVehicleId)
  const vehicleTrips = tripsForVehicle(data, selectedVehicleId)
  const selectedTrip = vehicleTrips.find((trip) => trip.id === selectedTripId)
  const tripPoints = locationsForTrip(data, selectedTripId)
  const history = locationsForVehicle(data, selectedVehicleId)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vehicle tracking"
        description="Inspect persisted locations, movement history and trip routes."
        action={
          <button
            type="button"
            onClick={() => setFitCounter((count) => count + 1)}
            className="btn-secondary"
          >
            <Crosshair size={14} /> Recenter map
          </button>
        }
      />

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          <strong>Historical sample data.</strong> Positions below were seeded into Supabase to demonstrate the workflow.
          This application does not receive live GPS telemetry and does not claim real-time tracking.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_310px]">
        <div className="surface flex h-full flex-col overflow-hidden">
          <div className="space-y-2.5 border-b border-ink-100 p-3.5">
            <SearchInput value={search} onChange={setSearch} placeholder="Find a vehicle…" />
            <SelectField
              value={status}
              allLabel="All statuses"
              options={vehicleStatuses.map((value) => ({ value, label: value === 'attention' ? 'Needs attention' : humanize(value) }))}
              onChange={setStatus}
            />
          </div>
          <div className="max-h-[560px] flex-1 overflow-y-auto">
            {filteredVehicles.length === 0 ? (
              <EmptyState title="No vehicles found" description="Adjust your search or status filter." />
            ) : (
              filteredVehicles.map((vehicle) => {
                const location = data.latestLocations.find((item) => item.vehicle_id === vehicle.id)
                const active = selectedVehicleId === vehicle.id
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => selectVehicle(vehicle.id)}
                    className={`flex w-full items-start gap-2.5 border-b border-ink-100 px-3.5 py-3 text-left transition ${
                      active ? 'bg-brand-50/70 ring-1 ring-inset ring-brand-200' : 'hover:bg-ink-50'
                    }`}
                  >
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      vehicle.status === 'moving' ? 'bg-emerald-500' : vehicle.status === 'idle' ? 'bg-amber-500' : vehicle.status === 'offline' ? 'bg-slate-400' : 'bg-red-500'
                    }`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-ink-900">{vehicle.registration_number}</span>
                      <span className="block truncate text-[10px] text-ink-500">{vehicle.vehicle_name}</span>
                      <span className="mt-1 block text-[10px] text-ink-400">
                        {location ? `${formatCoordinate(location.latitude, location.longitude)} · ${formatRelativeTime(location.recorded_at)}` : 'No location recorded'}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <FleetMap
          vehicles={data.vehicles}
          locations={data.latestLocations}
          trips={data.trips}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={selectVehicle}
          route={route}
          fitSignal={`${selectedVehicleId ?? 'all'}-${selectedTripId ?? 'none'}-${fitCounter}`}
          className="h-[430px] xl:h-[620px]"
        />

        <div className="surface h-full overflow-hidden">
          {!selected ? (
            <EmptyState icon={<MapPin size={20} />} title="Select a vehicle" description="Choose a vehicle from the list or click a marker to inspect its latest position." />
          ) : (
            <div className="space-y-4 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink-900">{selected.registration_number}</p>
                  <VehicleStatusBadge status={selected.status} />
                </div>
                <p className="mt-0.5 text-[11px] text-ink-500">{selected.vehicle_name} · {selected.vehicle_type}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-ink-50 p-2.5">
                  <p className="text-[10px] text-ink-500">Driver</p>
                  <p className="mt-0.5 font-semibold text-ink-800">{selected.driver_name ?? 'Unassigned'}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-2.5">
                  <p className="text-[10px] text-ink-500">Ignition</p>
                  <p className="mt-0.5 font-semibold text-ink-800">{selected.ignition_state ? 'On' : 'Off'}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-2.5">
                  <p className="text-[10px] text-ink-500">Last seen</p>
                  <p className="mt-0.5 font-semibold text-ink-800">{formatRelativeTime(selected.last_seen_at)}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-2.5">
                  <p className="text-[10px] text-ink-500">Speed</p>
                  <p className="mt-0.5 font-semibold text-ink-800">{selectedLocation ? formatSpeed(selectedLocation.speed) : '—'}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-ink-200 p-3">
                <ProgressBar value={selected.fuel_level} tone="fuel" label="Fuel" />
                <ProgressBar value={selected.battery_level} tone="battery" label="Battery" />
              </div>

              <div className="rounded-xl border border-ink-200 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-800">
                  <MapPin size={13} className="text-brand-600" /> Latest recorded position
                </p>
                {selectedLocation ? (
                  <div className="mt-2 space-y-1 text-[11px] text-ink-600">
                    <p className="font-mono">{formatCoordinate(selectedLocation.latitude, selectedLocation.longitude)}</p>
                    <p>{formatDateTime(selectedLocation.recorded_at)} · ignition {selectedLocation.ignition_state ? 'on' : 'off'}</p>
                    {selectedLocation.trip_id && <p className="text-brand-700">Associated trip {selectedLocation.trip_id.slice(0, 8)}</p>}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-ink-500">No position recorded.</p>
                )}
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-ink-800">
                  <RouteIcon size={13} className="text-brand-600" /> View a trip route
                </p>
                <select
                  aria-label="Select trip route"
                  className="input-control text-xs"
                  value={selectedTripId ?? ''}
                  onChange={(event) => setParam('trip', event.target.value || null)}
                >
                  <option value="">No route selected</option>
                  {vehicleTrips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.start_location} → {trip.end_location} · {formatDateTime(trip.started_at)}
                    </option>
                  ))}
                </select>
                {selectedTrip && (
                  <div className="mt-2 rounded-lg border border-brand-200 bg-brand-50/50 p-3 text-[11px] text-ink-700">
                    <p className="font-semibold text-ink-900">{selectedTrip.start_location} → {selectedTrip.end_location}</p>
                    <p className="mt-1">{formatDistance(selectedTrip.distance_km)} · {formatDuration(selectedTrip.duration_minutes)} · {tripPoints.length} recorded points</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-ink-500">
                      <Navigation size={11} /> Green = start, red = destination, blue = recorded points
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold text-ink-800">Recent movement history</p>
                {history.length === 0 ? (
                  <p className="text-[11px] text-ink-500">No movement points recorded.</p>
                ) : (
                  <ol className="space-y-2">
                    {history.slice(0, 6).map((point) => (
                      <li key={point.id} className="flex items-start justify-between gap-2 border-l-2 border-brand-200 pl-2.5 text-[10px]">
                        <span className="font-mono text-ink-700">{formatCoordinate(point.latitude, point.longitude)}</span>
                        <span className="whitespace-nowrap text-ink-400">{formatDateTime(point.recorded_at)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
