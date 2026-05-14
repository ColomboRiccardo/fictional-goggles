import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PricePoint } from '../types'
import { chartTheme } from '../utils/chartTheme'
import { formatCurrency } from '../utils/format'

interface PortfolioChartProps {
  points: PricePoint[]
}

export function PortfolioChart({ points }: PortfolioChartProps) {
  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: p.value,
  }))

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No history available.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: chartTheme.axis }} stroke={chartTheme.axis} />
        <YAxis
          tick={{ fontSize: 12, fill: chartTheme.axis }}
          stroke={chartTheme.axis}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            borderRadius: '8px',
            border: `1px solid ${chartTheme.tooltipBorder}`,
            backgroundColor: chartTheme.tooltipBg,
            color: chartTheme.tooltipText,
          }}
          labelStyle={{ color: chartTheme.tooltipText }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={chartTheme.line}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
