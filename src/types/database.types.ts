export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Table<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type ProfileRow = {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  created_at: string
  updated_at: string
}

export type DriverRow = {
  id: string
  full_name: string
  phone: string | null
  license_number: string
  status: 'active' | 'on_leave' | 'inactive'
  created_at: string
}

export type VehicleRow = {
  id: string
  registration_number: string
  vehicle_name: string
  vehicle_type: string
  manufacturer: string
  model: string
  driver_id: string | null
  status: 'moving' | 'idle' | 'offline' | 'attention'
  fuel_level: number
  battery_level: number
  ignition_state: boolean
  last_seen_at: string
  created_at: string
  updated_at: string
}

export type TripRow = {
  id: string
  vehicle_id: string
  driver_id: string | null
  start_location: string
  end_location: string
  start_latitude: number
  start_longitude: number
  end_latitude: number
  end_longitude: number
  started_at: string
  ended_at: string | null
  distance_km: number
  duration_minutes: number
  average_speed: number
  maximum_speed: number
  idle_minutes: number
  halt_count: number
  overspeed_events: number
  status: 'completed' | 'in_progress' | 'cancelled'
  created_at: string
}

export type LocationRow = {
  id: number
  vehicle_id: string
  trip_id: string | null
  latitude: number
  longitude: number
  speed: number
  recorded_at: string
  ignition_state: boolean
  created_at: string
}

export type LatestLocationRow = {
  vehicle_id: string
  trip_id: string | null
  latitude: number
  longitude: number
  speed: number
  recorded_at: string
  ignition_state: boolean
}

export type EventRow = {
  id: string
  vehicle_id: string
  trip_id: string | null
  event_type:
    | 'trip_started'
    | 'trip_completed'
    | 'vehicle_stopped'
    | 'vehicle_resumed'
    | 'overspeed_detected'
    | 'ignition_on'
    | 'ignition_off'
    | 'went_offline'
    | 'low_fuel'
    | 'low_battery'
    | 'long_idle'
  severity: 'info' | 'warning' | 'critical'
  description: string
  occurred_at: string
  acknowledged: boolean
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Partial<ProfileRow> & { id: string; email: string }, Partial<ProfileRow>>
      drivers: Table<DriverRow, Partial<DriverRow> & { full_name: string; license_number: string }, Partial<DriverRow>>
      vehicles: Table<VehicleRow, Partial<VehicleRow> & { registration_number: string; vehicle_name: string }, Partial<VehicleRow>>
      trips: Table<TripRow, Partial<TripRow> & { vehicle_id: string; started_at: string }, Partial<TripRow>>
      vehicle_locations: Table<LocationRow, Partial<LocationRow> & { vehicle_id: string }, Partial<LocationRow>>
      vehicle_events: Table<EventRow, Partial<EventRow> & { vehicle_id: string }, Partial<EventRow>>
    }
    Views: {
      vehicle_latest_location: { Row: LatestLocationRow; Relationships: [] }
      fleet_status_summary: { Row: { status: VehicleRow['status']; vehicle_count: number }; Relationships: [] }
    }
    Functions: {
      update_my_profile: { Args: { p_full_name: string }; Returns: ProfileRow }
      acknowledge_event: { Args: { p_event_id: string }; Returns: EventRow }
    }
    Enums: {
      user_role: 'admin' | 'operator' | 'viewer'
      driver_status: 'active' | 'on_leave' | 'inactive'
      vehicle_status: 'moving' | 'idle' | 'offline' | 'attention'
      trip_status: 'completed' | 'in_progress' | 'cancelled'
      event_type: EventRow['event_type']
      event_severity: EventRow['severity']
    }
    CompositeTypes: { [_ in never]: never }
  }
}
