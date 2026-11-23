import { createContext } from 'react'
import type { FleetSnapshot } from '../types/domain'

export type FleetDataContextValue = {
  data: FleetSnapshot | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  acknowledge: (eventId: string) => Promise<void>
  acknowledging: string | null
}

export const FleetDataContext = createContext<FleetDataContextValue | null>(null)
