export function ProgressBar({
  value,
  tone = 'brand',
  label,
}: {
  value: number
  tone?: 'brand' | 'fuel' | 'battery' | 'danger'
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const barTone =
    tone === 'danger' || clamped < 20
      ? 'bg-red-500'
      : tone === 'brand'
        ? 'bg-brand-500'
        : tone === 'fuel'
          ? clamped < 30 ? 'bg-amber-500' : 'bg-brand-500'
          : clamped < 25 ? 'bg-red-500' : 'bg-emerald-500'

  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-ink-500">
          <span>{label}</span>
          <span className="tabular-nums text-ink-700">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
