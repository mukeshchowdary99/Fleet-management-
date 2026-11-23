import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle2, Clock3, HeartPulse } from 'lucide-react'
import { PageHeader, SectionHeader } from '../components/ui/Card'
import { SearchInput, SelectField } from '../components/ui/Fields'
import { MetricCard } from '../components/dashboard/MetricCard'
import { AlertCard } from '../components/alerts/AlertCard'
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States'
import { useFleetData } from '../hooks/useFleetData'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { eventTypeLabels, severities } from '../utils/status'
import { humanize } from '../utils/format'
import type { EventSeverity, EventType, VehicleEvent } from '../types/domain'

type StateFilter = 'open' | 'acknowledged' | 'all'
const EMPTY_EVENTS: VehicleEvent[] = []

export function AlertsPage() {
  const { data, loading, error, refresh, acknowledge, acknowledging } = useFleetData()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<EventSeverity | 'all'>('all')
  const [eventType, setEventType] = useState<EventType | 'all'>('all')
  const [vehicleId, setVehicleId] = useState('all')
  const [state, setState] = useState<StateFilter>('open')
  const debouncedSearch = useDebouncedValue(search)

  const events = data?.events ?? EMPTY_EVENTS
  const eventTypes = useMemo(() => [...new Set(events.map((event) => event.event_type))], [events])
  const vehicleOptions = useMemo(
    () => (data?.vehicles ?? []).map((vehicle) => ({ value: vehicle.id, label: vehicle.registration_number })),
    [data],
  )

  if (error && !data) return <div className="surface"><ErrorState message={error} onRetry={() => void refresh()} /></div>
  if (!data || loading) return <div className="surface"><LoadingBlock rows={7} /></div>

  const filtered = events.filter((event) => {
    const term = debouncedSearch.trim().toLowerCase()
    return (
      (!term || `${event.description} ${event.registration_number} ${eventTypeLabels[event.event_type]}`.toLowerCase().includes(term)) &&
      (severity === 'all' || event.severity === severity) &&
      (eventType === 'all' || event.event_type === eventType) &&
      (vehicleId === 'all' || event.vehicle_id === vehicleId) &&
      (state === 'all' || (state === 'open' ? !event.acknowledged : event.acknowledged))
    )
  })

  const openCritical = events.filter((event) => !event.acknowledged && event.severity === 'critical').length
  const openWarning = events.filter((event) => !event.acknowledged && event.severity === 'warning').length
  const openCount = events.filter((event) => !event.acknowledged).length
  const acknowledgedCount = events.length - openCount

  const lowFuel = data.vehicles.filter((vehicle) => vehicle.fuel_level < 20)
  const lowBattery = data.vehicles.filter((vehicle) => vehicle.battery_level < 20)
  const overspeedTotal = data.trips.reduce((sum, trip) => sum + trip.overspeed_events, 0)

  const clearFilters = () => {
    setSearch('')
    setSeverity('all')
    setEventType('all')
    setVehicleId('all')
    setState('all')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Alerts & health" description="Triage operational events and review simple fleet health signals." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Open critical" value={openCritical} hint="Highest priority" icon={AlertTriangle} tone="red" />
        <MetricCard label="Open warnings" value={openWarning} hint="Review when possible" icon={Clock3} tone="amber" />
        <MetricCard label="Open events" value={openCount} hint="Not yet acknowledged" icon={Activity} tone="brand" />
        <MetricCard label="Acknowledged" value={acknowledgedCount} hint="Reviewed by the team" icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="surface">
        <SectionHeader
          title="Fleet health signals"
          description="Directly aggregated from persisted vehicle and trip records — no predictive modelling."
          className="border-b border-ink-100 px-5 py-4"
        />
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <div className="rounded-lg border border-ink-200 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700"><HeartPulse size={13} className="text-amber-500" /> Low fuel</p>
            <p className="mt-1 text-xl font-semibold text-ink-900">{lowFuel.length}</p>
            <p className="mt-0.5 text-[10px] leading-4 text-ink-500">
              {lowFuel.length ? lowFuel.map((vehicle) => vehicle.registration_number).join(', ') : 'All vehicles above 20%'}
            </p>
          </div>
          <div className="rounded-lg border border-ink-200 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700"><HeartPulse size={13} className="text-red-500" /> Low battery</p>
            <p className="mt-1 text-xl font-semibold text-ink-900">{lowBattery.length}</p>
            <p className="mt-0.5 text-[10px] leading-4 text-ink-500">
              {lowBattery.length ? lowBattery.map((vehicle) => vehicle.registration_number).join(', ') : 'All vehicles above 20%'}
            </p>
          </div>
          <div className="rounded-lg border border-ink-200 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700"><Activity size={13} className="text-brand-500" /> Overspeed history</p>
            <p className="mt-1 text-xl font-semibold text-ink-900">{overspeedTotal}</p>
            <p className="mt-0.5 text-[10px] leading-4 text-ink-500">Events recorded across all trips</p>
          </div>
        </div>
      </div>

      <div className="surface flex flex-wrap items-center gap-3 p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search alerts…" className="min-w-[200px] flex-1" />
        <SelectField value={severity} allLabel="All severities" options={severities.map((value) => ({ value, label: humanize(value) }))} onChange={setSeverity} className="min-w-[135px]" />
        <SelectField value={eventType} allLabel="All types" options={eventTypes.map((value) => ({ value, label: eventTypeLabels[value] }))} onChange={setEventType} className="min-w-[155px]" />
        <SelectField value={vehicleId} allLabel="All vehicles" options={vehicleOptions} onChange={setVehicleId} className="min-w-[150px]" />
        <SelectField
          value={state}
          allLabel="All states"
          options={[
            { value: 'open' as const, label: 'Open' },
            { value: 'acknowledged' as const, label: 'Acknowledged' },
          ]}
          onChange={(value) => setState(value as StateFilter)}
          className="min-w-[135px]"
        />
        <button type="button" onClick={clearFilters} className="text-[11px] font-semibold text-brand-600 hover:text-brand-700">Reset</button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="surface">
            <EmptyState
              title="No alerts match your filters"
              description="Try switching state to All states or clearing the severity and vehicle filters."
              action={<button type="button" className="btn-secondary" onClick={clearFilters}>Reset filters</button>}
            />
          </div>
        ) : (
          filtered.map((event) => (
            <AlertCard
              key={event.id}
              event={event}
              onAcknowledge={(id) => void acknowledge(id)}
              acknowledging={acknowledging === event.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
