import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, RotateCw, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/Card'
import { SearchInput, SelectField } from '../components/ui/Fields'
import { VehicleStatusBadge } from '../components/ui/Badges'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States'
import { VehicleDetailDrawer } from '../components/fleet/VehicleDetailDrawer'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useFleetData } from '../hooks/useFleetData'
import type { Vehicle, VehicleStatus } from '../types/domain'
import { vehicleStatuses } from '../utils/status'
import { formatRelativeTime, humanize } from '../utils/format'

type SortKey = 'registration_number' | 'vehicle_name' | 'status' | 'fuel_level' | 'battery_level' | 'last_seen_at'
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE = 10
const EMPTY_VEHICLES: Vehicle[] = []

const headers: Array<{ key: SortKey | null; label: string }> = [
  { key: 'registration_number', label: 'Registration' },
  { key: 'vehicle_name', label: 'Vehicle' },
  { key: null, label: 'Type' },
  { key: null, label: 'Driver' },
  { key: 'status', label: 'Status' },
  { key: 'fuel_level', label: 'Fuel' },
  { key: 'battery_level', label: 'Battery' },
  { key: null, label: 'Ignition' },
  { key: 'last_seen_at', label: 'Last seen' },
  { key: null, label: 'Location' },
]

export function FleetPage() {
  const { data, loading, error, refresh } = useFleetData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('registration_number')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)
  const status = (searchParams.get('status') ?? 'all') as VehicleStatus | 'all'
  const selectedVehicleId = searchParams.get('vehicle')

  useEffect(() => setPage(1), [debouncedSearch, status, type])

  const vehicles = data?.vehicles ?? EMPTY_VEHICLES
  const vehicleTypes = useMemo(() => [...new Set(vehicles.map((vehicle) => vehicle.vehicle_type))].sort(), [vehicles])

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    const result = vehicles.filter((vehicle) => {
      const matchesSearch =
        !term ||
        vehicle.registration_number.toLowerCase().includes(term) ||
        vehicle.vehicle_name.toLowerCase().includes(term)
      const matchesStatus = status === 'all' || vehicle.status === status
      const matchesType = type === 'all' || vehicle.vehicle_type === type
      return matchesSearch && matchesStatus && matchesType
    })
    return result.sort((a, b) => {
      const left = a[sortKey]
      const right = b[sortKey]
      const comparison = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [vehicles, debouncedSearch, status, type, sortKey, sortDirection])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const setParam = (key: string, value: string | null) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value && value !== 'all') next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  const latestLocation = (vehicleId: string) =>
    data?.latestLocations.find((location) => location.vehicle_id === vehicleId)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fleet"
        description="Inspect vehicles, assigned drivers, health indicators and last known positions."
        action={
          <Button onClick={() => void refresh()} disabled={loading}>
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        }
      />

      {error && !data ? (
        <div className="surface"><ErrorState message={error} onRetry={() => void refresh()} /></div>
      ) : !data || loading ? (
        <div className="surface"><LoadingBlock rows={8} /></div>
      ) : (
        <>
          <div className="surface flex flex-wrap items-center gap-3 p-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search registration or vehicle name…" className="min-w-[220px] flex-1" />
            <SelectField
              value={status}
              allLabel="All statuses"
              options={vehicleStatuses.map((value) => ({ value, label: value === 'attention' ? 'Needs attention' : humanize(value) }))}
              onChange={(value) => setParam('status', value)}
              className="min-w-[150px]"
            />
            <SelectField
              value={type as 'all' | string}
              allLabel="All vehicle types"
              options={vehicleTypes.map((value) => ({ value, label: value }))}
              onChange={setType}
              className="min-w-[165px]"
            />
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
              <SlidersHorizontal size={13} /> {filtered.length} of {vehicles.length} vehicles
            </span>
          </div>

          <div className="surface overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState
                title="No vehicles match your filters"
                description="Try a different registration, status or vehicle type."
                action={<Button onClick={() => { setSearch(''); setType('all'); setParam('status', null) }}>Clear filters</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table-shell min-w-[1080px]">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th key={header.label}>
                          {header.key ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(header.key as SortKey)}
                              className="inline-flex items-center gap-1 uppercase hover:text-ink-800"
                            >
                              {header.label}
                              {sortKey === header.key &&
                                (sortDirection === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                            </button>
                          ) : (
                            header.label
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((vehicle: Vehicle) => {
                      const location = latestLocation(vehicle.id)
                      return (
                        <tr
                          key={vehicle.id}
                          tabIndex={0}
                          role="button"
                          aria-label={`Open details for ${vehicle.registration_number}`}
                          onClick={() => setParam('vehicle', vehicle.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setParam('vehicle', vehicle.id)
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <td className="whitespace-nowrap font-mono text-xs font-semibold text-brand-700">{vehicle.registration_number}</td>
                          <td>
                            <p className="whitespace-nowrap text-xs font-semibold text-ink-800">{vehicle.vehicle_name}</p>
                            <p className="text-[10px] text-ink-500">{vehicle.manufacturer} {vehicle.model}</p>
                          </td>
                          <td className="whitespace-nowrap text-xs">{vehicle.vehicle_type}</td>
                          <td className="whitespace-nowrap text-xs">{vehicle.driver_name ?? <span className="text-ink-400">Unassigned</span>}</td>
                          <td><VehicleStatusBadge status={vehicle.status} /></td>
                          <td className="w-28"><ProgressBar value={vehicle.fuel_level} tone="fuel" /></td>
                          <td className="w-28"><ProgressBar value={vehicle.battery_level} tone="battery" /></td>
                          <td>
                            <span className={`text-[11px] font-semibold ${vehicle.ignition_state ? 'text-emerald-600' : 'text-ink-400'}`}>
                              {vehicle.ignition_state ? 'On' : 'Off'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-xs">{formatRelativeTime(vehicle.last_seen_at)}</td>
                          <td className="max-w-[160px] truncate text-xs">{location ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}` : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
                <p className="text-[11px] text-ink-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="px-2 py-1.5">
                    <ChevronLeft size={15} />
                  </Button>
                  <span className="text-[11px] font-medium tabular-nums text-ink-600">{currentPage} / {pageCount}</span>
                  <Button aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="px-2 py-1.5">
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <VehicleDetailDrawer
        vehicleId={selectedVehicleId}
        onClose={() => setParam('vehicle', null)}
      />
    </div>
  )
}
