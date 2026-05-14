import type { Period } from '../types'

const periods: { value: Period; label: string }[] = [
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '1y', label: '1Y' },
]

interface PeriodToggleProps {
  value: Period
  onChange: (period: Period) => void
}

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 p-1">
      {periods.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            value === period.value
              ? 'bg-slate-700 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
