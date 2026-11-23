import type {
  DriverRow,
  EventRow,
  LatestLocationRow,
  LocationRow,
  ProfileRow,
  TripRow,
  VehicleRow,
} from './database.types'

export type { DriverRow, EventRow, LatestLocationRow, LocationRow, ProfileRow, TripRow, VehicleRow }

export type VehicleStatus = VehicleRow['status']
export type TripStatus = TripRow['status']
export type EventSeverity = EventRow['severity']
export type EventType = EventRow['event_type']

export type Vehicle = VehicleRow & { driver_name: string | null }
export type Trip = TripRow & { registration_number: string; driver_name: string | null }
export type VehicleEvent = EventRow & { registration_number: string; vehicle_name: string }
export type LatestLocation = LatestLocationRow

export type FleetSnapshot = {
  vehicles: Vehicle[]
  trips: Trip[]
  events: VehicleEvent[]
  latestLocations: LatestLocation[]
  locations: LocationRow[]
}

export type FleetMetrics = {
  total: number
  moving: number
  idle: number
  offline: number
  attention: number
  unacknowledged: number
}
