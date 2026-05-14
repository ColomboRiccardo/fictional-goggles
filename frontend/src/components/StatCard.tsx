import { pnlColor } from '../utils/format'

interface StatCardProps {
  label: string
  value: string
  subValue?: string
  subValueNumeric?: number
}

export function StatCard({ label, value, subValue, subValueNumeric }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
      {subValue && (
        <p className={`mt-1 text-sm font-medium ${subValueNumeric !== undefined ? pnlColor(subValueNumeric) : 'text-slate-400'}`}>
          {subValue}
        </p>
      )}
    </div>
  )
}
