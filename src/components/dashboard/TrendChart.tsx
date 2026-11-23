import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SectionHeader } from '../ui/Card'
import type { Trip } from '../../types/domain'
import { tripTrend } from '../../utils/selectors'

export function TrendChart({ trips }: { trips: Trip[] }) {
  const data = tripTrend(trips, 14)

  return (
    <div className="surface">
      <SectionHeader
        title="Trip activity"
        description="Trips and distance over the last 14 days"
        className="px-5 py-4"
        action={
          <div className="flex items-center gap-3 text-[10px] font-medium text-ink-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-brand-500" /> Trips</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Distance (km)</span>
          </div>
        }
      />
      <div className="h-[220px] px-2 pb-4 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} interval={2} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis yAxisId="trips" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
            <YAxis yAxisId="distance" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11, boxShadow: '0 8px 24px rgba(15,23,42,.08)' }}
              labelStyle={{ fontWeight: 600, color: '#0f172a' }}
            />
            <Bar yAxisId="trips" dataKey="trips" name="Trips" fill="#3267f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
            <Line yAxisId="distance" type="monotone" dataKey="distance" name="Distance (km)" stroke="#10b981" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
