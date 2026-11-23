import type { LucideIcon } from 'lucide-react'

type Tone = 'brand' | 'emerald' | 'amber' | 'slate' | 'red'

const toneClass: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
  red: 'bg-red-50 text-red-600',
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
  onClick,
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: Tone
  onClick?: () => void
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}>
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-500">{hint}</p>}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="surface p-4 text-left transition hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {content}
      </button>
    )
  }
  return <div className="surface p-4">{content}</div>
}
