import type { LucideIcon } from 'lucide-react'
import {
  BatteryLow,
  CheckCircle2,
  Clock3,
  Fuel,
  Gauge,
  Play,
  PlayCircle,
  Power,
  PowerOff,
  Square,
  WifiOff,
} from 'lucide-react'
import type { EventType } from '../../types/domain'

const icons: Record<EventType, LucideIcon> = {
  trip_started: PlayCircle,
  trip_completed: CheckCircle2,
  vehicle_stopped: Square,
  vehicle_resumed: Play,
  overspeed_detected: Gauge,
  ignition_on: Power,
  ignition_off: PowerOff,
  went_offline: WifiOff,
  low_fuel: Fuel,
  low_battery: BatteryLow,
  long_idle: Clock3,
}

export function EventIcon({ type, className = '' }: { type: EventType; className?: string }) {
  const Icon = icons[type]
  return <Icon size={15} className={className} aria-hidden="true" />
}
