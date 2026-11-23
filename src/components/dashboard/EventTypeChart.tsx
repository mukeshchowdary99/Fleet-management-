import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SectionHeader } from '../ui/Card'
import type { VehicleEvent } from '../../types/domain'
import { eventTypeBreakdown } from '../../utils/selectors'
import { humanize } from '../../utils/format'

export function EventTypeChart({ events }: { events: VehicleEvent[] }) {
  const data = eventTypeBreakdown(events, 5).map((item) => ({ ...item, label: humanize(item.type) }))

  return (
    <div className="surface flex h-full flex-col">
      <SectionHeader
        title="Event mix"
        description="Most frequent recorded event types"
        className="px-5 py-4"
      />
      <div className="h-[220px] flex-1 px-3 pb-4">
        {data.length === 0 ? (
          <p className="px-3 py-10 text-center text-xs text-ink-500">No events recorded yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 6 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={104} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }}
              />
              <Bar dataKey="count" name="Events" fill="#3267f6" radius={[0, 4, 4, 0]} barSize={13} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
