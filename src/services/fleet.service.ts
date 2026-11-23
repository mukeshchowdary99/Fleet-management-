import { requireClient } from '../lib/supabase'
import type { DriverRow, FleetSnapshot, LatestLocation, LocationRow, Trip, Vehicle, VehicleEvent } from '../types/domain'

function checkError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`)
}

export async function fetchFleetSnapshot(): Promise<FleetSnapshot> {
  const client = requireClient()

  const [vehiclesResult, driversResult, tripsResult, eventsResult, latestResult, locationsResult] =
    await Promise.all([
      client.from('vehicles').select('*').order('registration_number'),
      client.from('drivers').select('*').order('full_name'),
      client.from('trips').select('*').order('started_at', { ascending: false }),
      client.from('vehicle_events').select('*').order('occurred_at', { ascending: false }),
      client.from('vehicle_latest_location').select('*'),
      client.from('vehicle_locations').select('*').order('recorded_at', { ascending: false }),
    ])

  checkError(vehiclesResult.error, 'Could not load vehicles')
  checkError(driversResult.error, 'Could not load drivers')
  checkError(tripsResult.error, 'Could not load trips')
  checkError(eventsResult.error, 'Could not load events')
  checkError(latestResult.error, 'Could not load latest locations')
  checkError(locationsResult.error, 'Could not load location history')

  const drivers: DriverRow[] = driversResult.data ?? []
  const driverName = (id: string | null): string | null =>
    id ? (drivers.find((driver) => driver.id === id)?.full_name ?? null) : null
  const vehicleName = (id: string): { registration_number: string; vehicle_name: string } => {
    const vehicle = (vehiclesResult.data ?? []).find((item) => item.id === id)
    return {
      registration_number: vehicle?.registration_number ?? 'Unknown vehicle',
      vehicle_name: vehicle?.vehicle_name ?? 'Unknown vehicle',
    }
  }

  const vehicles: Vehicle[] = (vehiclesResult.data ?? []).map((vehicle) => ({
    ...vehicle,
    driver_name: driverName(vehicle.driver_id),
  }))

  const trips: Trip[] = (tripsResult.data ?? []).map((trip) => ({
    ...trip,
    registration_number: vehicleName(trip.vehicle_id).registration_number,
    driver_name: driverName(trip.driver_id),
  }))

  const events: VehicleEvent[] = (eventsResult.data ?? []).map((event) => ({
    ...event,
    ...vehicleName(event.vehicle_id),
  }))

  return {
    vehicles,
    trips,
    events,
    latestLocations: (latestResult.data ?? []) as LatestLocation[],
    locations: (locationsResult.data ?? []) as LocationRow[],
  }
}
