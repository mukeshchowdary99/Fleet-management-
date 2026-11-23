import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Gauge, Route as RouteIcon, Timer, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/Card'
import { SearchInput, SelectField } from '../components/ui/Fields'
import { TripStatusBadge } from '../components/ui/Badges'
import { MetricCard } from '../components/dashboard/MetricCard'
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States'
import { useFleetData } from '../hooks/useFleetData'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { tripStatuses } from '../utils/status'
import { formatDateTime, formatDistance, formatDuration, formatSpeed, humanize, startOfDay, toDateInputValue } from '../utils/format'
import type { Trip, TripStatus } from '../types/domain'

const EMPTY_TRIPS: Trip[] = []

export function TripsPage() {
  const { data, loading, error, refresh } = useFleetData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [vehicleId, setVehicleId] = useState('all')
  const [status, setStatus] = useState<TripStatus | 'all'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    setToDate(toDateInputValue(new Date()))
    setFromDate(toDateInputValue(new Date(startOfDay(new Date()).getTime() - 30 * 86400000)))
  }, [])

  const trips = data?.trips ?? EMPTY_TRIPS
  const vehicleOptions = useMemo(
    () => [...new Map(trips.map((trip) => [trip.vehicle_id, trip.registration_number])).entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [trips],
  )

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : -Infinity
    const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity
    return trips.filter((trip) => {
      const started = new Date(trip.started_at).getTime()
      const matchesTerm =
        !term ||
        trip.id.toLowerCase().includes(term) ||
        trip.start_location.toLowerCase().includes(term) ||
        trip.end_location.toLowerCase().includes(term) ||
        trip.registration_number.toLowerCase().includes(term) ||
        (trip.driver_name ?? '').toLowerCase().includes(term)
      return (
        matchesTerm &&
        started >= from &&
        started <= to &&
        (vehicleId === 'all' || trip.vehicle_id === vehicleId) &&
        (status === 'all' || trip.status === status)
      )
    })
  }, [trips, debouncedSearch, fromDate, toDate, vehicleId, status])

  const summary = useMemo(() => {
    const distance = filtered.reduce((sum, trip) => sum + Number(trip.distance_km), 0)
    const duration = filtered.reduce((sum, trip) => sum + trip.duration_minutes, 0)
    const overspeed = filtered.reduce((sum, trip) => sum + trip.overspeed_events, 0)
    return {
      distance: formatDistance(distance),
      duration: formatDuration(duration),
      overspeed,
      avgSpeed: filtered.length ? formatSpeed(filtered.reduce((sum, trip) => sum + Number(trip.average_speed), 0) / filtered.length) : '—',
    }
  }, [filtered])

  const clearFilters = () => {
    setSearch('')
    setVehicleId('all')
    setStatus('all')
    setToDate(toDateInputValue(new Date()))
    setFromDate(toDateInputValue(new Date(startOfDay(new Date()).getTime() - 30 * 86400000)))
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Trips" description="Review trip history, route details and driving performance." />

      {error && !data ? (
        <div className="surface"><ErrorState message={error} onRetry={() => void refresh()} /></div>
      ) : !data || loading ? (
        <div className="surface"><LoadingBlock rows={8} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Trips in view" value={filtered.length} hint="Matching current filters" icon={RouteIcon} />
            <MetricCard label="Distance travelled" value={summary.distance} hint="Across filtered trips" icon={TrendingUp} tone="emerald" />
            <MetricCard label="Total drive time" value={summary.duration} hint="Sum of trip durations" icon={Timer} tone="amber" />
            <MetricCard label="Overspeed events" value={summary.overspeed} hint={`Average speed ${summary.avgSpeed}`} icon={Gauge} tone="red" />
          </div>

          <div className="surface flex flex-wrap items-center gap-3 p-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search trip, vehicle, driver or location…" className="min-w-[230px] flex-1" />
            <SelectField
              value={vehicleId}
              allLabel="All vehicles"
              options={vehicleOptions}
              onChange={setVehicleId}
              className="min-w-[160px]"
            />
            <SelectField
              value={status}
              allLabel="All trip statuses"
              options={tripStatuses.map((value) => ({ value, label: humanize(value) }))}
              onChange={setStatus}
              className="min-w-[150px]"
            />
            <div className="flex items-center gap-2 text-[11px] text-ink-500">
              <label htmlFor="from-date">From</label>
              <input id="from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="input-control w-[140px] py-1.5 text-xs" />
              <label htmlFor="to-date">To</label>
              <input id="to-date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="input-control w-[140px] py-1.5 text-xs" />
            </div>
            <button type="button" onClick={clearFilters} className="text-[11px] font-semibold text-brand-600 hover:text-brand-700">
              Reset filters
            </button>
          </div>

          <div className="surface overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState
                title="No trips match your filters"
                description="Try widening the date range or clearing the vehicle and status filters."
                action={<button type="button" className="btn-secondary" onClick={clearFilters}>Reset filters</button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table-shell min-w-[1500px]">
                  <thead>
                    <tr>
                      <th>Trip ID</th>
                      <th>Vehicle</th>
                      <th>Driver</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Started</th>
                      <th>Ended</th>
                      <th>Distance</th>
                      <th>Duration</th>
                      <th>Avg speed</th>
                      <th>Max speed</th>
                      <th>Idle</th>
                      <th>Halts</th>
                      <th>Overspeed</th>
                      <th>Status</th>
                      <th aria-label="Open" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((trip) => (
                      <tr
                        key={trip.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`Open trip ${trip.id}`}
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            navigate(`/trips/${trip.id}`)
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <td className="whitespace-nowrap font-mono text-[11px] font-semibold text-brand-700">{trip.id.slice(0, 8)}</td>
                        <td className="whitespace-nowrap text-xs font-semibold">{trip.registration_number}</td>
                        <td className="whitespace-nowrap text-xs">{trip.driver_name ?? 'Unassigned'}</td>
                        <td className="whitespace-nowrap text-xs">{trip.start_location}</td>
                        <td className="whitespace-nowrap text-xs">{trip.end_location}</td>
                        <td className="whitespace-nowrap text-xs">{formatDateTime(trip.started_at)}</td>
                        <td className="whitespace-nowrap text-xs">{formatDateTime(trip.ended_at)}</td>
                        <td className="whitespace-nowrap tabular-nums">{formatDistance(trip.distance_km)}</td>
                        <td className="whitespace-nowrap tabular-nums">{formatDuration(trip.duration_minutes)}</td>
                        <td className="whitespace-nowrap tabular-nums">{formatSpeed(trip.average_speed)}</td>
                        <td className="whitespace-nowrap tabular-nums">{formatSpeed(trip.maximum_speed)}</td>
                        <td className="whitespace-nowrap tabular-nums">{trip.idle_minutes} min</td>
                        <td className="tabular-nums">{trip.halt_count}</td>
                        <td className="tabular-nums">{trip.overspeed_events}</td>
                        <td><TripStatusBadge status={trip.status} /></td>
                        <td><ArrowUpRight size={15} className="text-ink-400" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t border-ink-100 px-4 py-3 text-[11px] text-ink-500">
              {filtered.length} trip{filtered.length === 1 ? '' : 's'} shown · click a row to open the trip detail view
            </div>
          </div>
        </>
      )}
    </div>
  )
}
