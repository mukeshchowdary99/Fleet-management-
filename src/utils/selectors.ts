import type { FleetMetrics, FleetSnapshot, Trip, Vehicle, VehicleEvent } from '../types/domain'

export function buildFleetMetrics(snapshot: FleetSnapshot): FleetMetrics {
  const vehicles = snapshot.vehicles
  return {
    total: vehicles.length,
    moving: vehicles.filter((vehicle) => vehicle.status === 'moving').length,
    idle: vehicles.filter((vehicle) => vehicle.status === 'idle').length,
    offline: vehicles.filter((vehicle) => vehicle.status === 'offline').length,
    attention: vehicles.filter((vehicle) => vehicle.status === 'attention').length,
    unacknowledged: snapshot.events.filter((event) => !event.acknowledged).length,
  }
}

export function vehicleById(snapshot: FleetSnapshot, id: string | null | undefined): Vehicle | undefined {
  if (!id) return undefined
  return snapshot.vehicles.find((vehicle) => vehicle.id === id)
}

export function tripById(snapshot: FleetSnapshot, id: string | null | undefined): Trip | undefined {
  if (!id) return undefined
  return snapshot.trips.find((trip) => trip.id === id)
}

export function locationsForTrip(snapshot: FleetSnapshot, tripId: string | null | undefined) {
  if (!tripId) return []
  return snapshot.locations
    .filter((location) => location.trip_id === tripId)
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
}

export function locationsForVehicle(snapshot: FleetSnapshot, vehicleId: string | null | undefined) {
  if (!vehicleId) return []
  return snapshot.locations
    .filter((location) => location.vehicle_id === vehicleId)
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
}

export function tripsForVehicle(snapshot: FleetSnapshot, vehicleId: string | null | undefined) {
  if (!vehicleId) return []
  return snapshot.trips
    .filter((trip) => trip.vehicle_id === vehicleId)
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
}

export function eventsForVehicle(snapshot: FleetSnapshot, vehicleId: string | null | undefined) {
  if (!vehicleId) return []
  return snapshot.events
    .filter((event) => event.vehicle_id === vehicleId)
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
}

export function attentionEvents(events: VehicleEvent[]): VehicleEvent[] {
  const relevant = new Set(['overspeed_detected', 'low_fuel', 'low_battery', 'went_offline', 'long_idle'])
  return events
    .filter((event) => !event.acknowledged && relevant.has(event.event_type))
    .sort((a, b) => {
      const rank = { critical: 0, warning: 1, info: 2 }
      const diff = rank[a.severity] - rank[b.severity]
      return diff !== 0 ? diff : b.occurred_at.localeCompare(a.occurred_at)
    })
}

export function tripTrend(trips: Trip[], days = 14) {
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (days - 1 - index))
    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(date),
      trips: 0,
      distance: 0,
    }
  })
  const index = new Map(buckets.map((bucket, position) => [bucket.key, position]))
  trips.forEach((trip) => {
    const position = index.get(trip.started_at.slice(0, 10))
    if (position === undefined) return
    buckets[position].trips += 1
    buckets[position].distance += Number(trip.distance_km)
  })
  return buckets.map((bucket) => ({ ...bucket, distance: Math.round(bucket.distance) }))
}

export function eventTypeBreakdown(events: VehicleEvent[], limit = 5) {
  const counts = new Map<string, number>()
  events.forEach((event) => counts.set(event.event_type, (counts.get(event.event_type) ?? 0) + 1))
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
