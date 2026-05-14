import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Holding } from '../types'
import { chartTheme } from '../utils/chartTheme'
import { formatCurrency } from '../utils/format'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

interface AllocationChartProps {
  holdings: Holding[]
}

export function AllocationChart({ holdings }: AllocationChartProps) {
  const data = holdings.map((h) => ({
    name: h.symbol,
    value: h.market_value,
  }))

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No holdings to display.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  )
}
