import { useContext } from 'react'
import { FleetDataContext } from '../contexts/fleet-context'

export function useFleetData() {
  const context = useContext(FleetDataContext)
  if (!context) throw new Error('useFleetData must be used inside FleetDataProvider')
  return context
}
