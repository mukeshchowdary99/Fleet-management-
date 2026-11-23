import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { FleetDataContext } from './fleet-context'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { acknowledgeEvent } from '../services/auth.service'
import { fetchFleetSnapshot } from '../services/fleet.service'
import type { FleetSnapshot } from '../types/domain'

export function FleetDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const [data, setData] = useState<FleetSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setData(await fetchFleetSnapshot())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load fleet data.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      void refresh()
    } else {
      setData(null)
      setLoading(false)
    }
  }, [user, refresh])

  const acknowledge = useCallback(
    async (eventId: string) => {
      setAcknowledging(eventId)
      try {
        const updated = await acknowledgeEvent(eventId)
        setData((current) =>
          current
            ? {
                ...current,
                events: current.events.map((event) => (event.id === updated.id ? { ...event, ...updated } : event)),
              }
            : current,
        )
        pushToast('Alert acknowledged.', 'success')
      } catch (cause) {
        pushToast(cause instanceof Error ? cause.message : 'Could not acknowledge alert.', 'error')
      } finally {
        setAcknowledging(null)
      }
    },
    [pushToast],
  )

  const value = useMemo(
    () => ({ data, loading, error, refresh, acknowledge, acknowledging }),
    [data, loading, error, refresh, acknowledge, acknowledging],
  )

  return <FleetDataContext.Provider value={value}>{children}</FleetDataContext.Provider>
}
