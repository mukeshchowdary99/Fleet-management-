import { Search } from 'lucide-react'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        aria-label={placeholder}
        className="input-control pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export type SelectOption<T extends string> = { value: T; label: string }

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  allLabel,
  className = '',
}: {
  value: T | 'all'
  onChange: (value: T | 'all') => void
  options: SelectOption<T>[]
  allLabel: string
  className?: string
}) {
  return (
    <select
      aria-label={allLabel}
      className={`input-control cursor-pointer ${className}`}
      value={value}
      onChange={(event) => onChange(event.target.value as T | 'all')}
    >
      <option value="all">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
