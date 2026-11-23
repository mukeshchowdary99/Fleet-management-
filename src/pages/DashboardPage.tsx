import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, AlertTriangle, CircleDot, MapPin, Power, Truck } from 'lucide-react'
import { PageHeader } from '../components/ui/Card'
import { MetricCard } from '../components/dashboard/MetricCard'
import { FleetMap } from '../components/map/FleetMap'
import { AttentionPanel } from '../components/dashboard/AttentionPanel'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { RecentTripsTable } from '../components/dashboard/RecentTripsTable'
import { TrendChart } from '../components/dashboard/TrendChart'
import { EventTypeChart } from '../components/dashboard/EventTypeChart'
import { VehicleStatusBadge } from '../components/ui/Badges'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ErrorState, LoadingBlock, Skeleton } from '../components/ui/States'
import { useFleetData } from '../hooks/useFleetData'
import { attentionEvents, buildFleetMetrics, vehicleById } from '../utils/selectors'
import { formatCoordinate, formatDateTime, formatRelativeTime } from '../utils/format'

export function DashboardPage() {
  const { data, loading, error, refresh } = useFleetData()
  const navigate = useNavigate()
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const handleSelect = useCallback((id: string) => setSelectedVehicleId(id), [])
  const go = useCallback((path: string) => navigate(path), [navigate])
  const snapshotLabel = formatDateTime(new Date().toISOString())

  if (error && !data) return <div className="surface"><ErrorState message={error} onRetry={() => void refresh()} /></div>
  if (!data || loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-28" />)}</div>
        <div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-[440px] lg:col-span-2" /><Skeleton className="h-[440px]" /></div>
        <div className="surface"><LoadingBlock rows={5} /></div>
      </div>
    )
  }

  const metrics = buildFleetMetrics(data)
  const alerts = attentionEvents(data.events)
  const selected = vehicleById(data, selectedVehicleId)
  const selectedLocation = data.latestLocations.find((location) => location.vehicle_id === selectedVehicleId)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fleet overview"
        description="Operational snapshot from persisted vehicle, trip and event data."
        action={
          <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-[11px] font-medium text-ink-500 shadow-card">
            <Activity size={14} className="text-emerald-500" />
            Snapshot generated · {snapshotLabel}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <MetricCard label="Total vehicles" value={metrics.total} hint="Across all depots" icon={Truck} tone="brand" onClick={() => go('/fleet')} />
        <MetricCard label="Moving" value={metrics.moving} hint="Recently reported motion" icon={CircleDot} tone="emerald" onClick={() => go('/fleet?status=moving')} />
        <MetricCard label="Idle" value={metrics.idle} hint="Stationary, ignition on" icon={Power} tone="amber" onClick={() => go('/fleet?status=idle')} />
        <MetricCard label="Offline" value={metrics.offline} hint="No recent location" icon={MapPin} tone="slate" onClick={() => go('/fleet?status=offline')} />
        <MetricCard label="Needs attention" value={metrics.attention} hint={`${metrics.unacknowledged} open events`} icon={AlertTriangle} tone="red" onClick={() => go('/alerts')} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface overflow-hidden lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">Fleet map</h2>
              <p className="mt-0.5 text-xs text-ink-500">Select a marker to inspect the vehicle's latest recorded position.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-ink-500">
              {(['moving', 'idle', 'offline', 'attention'] as const).map((status) => (
                <span key={status} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${status === 'moving' ? 'bg-emerald-500' : status === 'idle' ? 'bg-amber-500' : status === 'offline' ? 'bg-slate-400' : 'bg-red-500'}`} />
                  {status === 'attention' ? 'Attention' : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              ))}
            </div>
          </div>
          <FleetMap
            vehicles={data.vehicles}
            locations={data.latestLocations}
            trips={data.trips}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={handleSelect}
            fitSignal="dashboard-fleet"
            className="h-[360px] rounded-none border-0 sm:h-[420px]"
          />
          {selected && selectedLocation && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-ink-100 bg-ink-50/50 px-5 py-3">
              <div>
                <p className="text-xs font-bold text-ink-900">{selected.registration_number}</p>
                <p className="text-[10px] text-ink-500">{selected.vehicle_name}</p>
              </div>
              <VehicleStatusBadge status={selected.status} />
              <div className="text-[11px] text-ink-600">
                <span className="text-ink-400">Driver </span>{selected.driver_name ?? 'Unassigned'}
              </div>
              <div className="text-[11px] text-ink-600">
                <span className="text-ink-400">Coords </span><span className="font-mono">{formatCoordinate(selectedLocation.latitude, selectedLocation.longitude)}</span>
              </div>
              <div className="text-[11px] text-ink-600">
                <span className="text-ink-400">Seen </span>{formatRelativeTime(selectedLocation.recorded_at)}
              </div>
              <div className="w-28"><ProgressBar value={selected.fuel_level} tone="fuel" label="Fuel" /></div>
              <div className="w-28"><ProgressBar value={selected.battery_level} tone="battery" label="Battery" /></div>
              <Link to={`/fleet?vehicle=${selected.id}`} className="ml-auto text-[11px] font-semibold text-brand-600 hover:text-brand-700">
                Open vehicle →
              </Link>
            </div>
          )}
        </div>
        <AttentionPanel events={alerts} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><TrendChart trips={data.trips} /></div>
        <EventTypeChart events={data.events} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1"><ActivityFeed events={data.events} /></div>
        <div className="lg:col-span-2"><RecentTripsTable trips={data.trips} /></div>
      </div>
    </div>
  )
}
