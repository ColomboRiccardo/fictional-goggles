import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  useXAxisScale,
  useYAxisScale,
  XAxis,
  YAxis,
} from 'recharts'
import type { CandlePoint } from '../types'
import { chartTheme } from '../utils/chartTheme'
import { formatCurrency, formatNumber } from '../utils/format'

interface CandlestickChartProps {
  candles: CandlePoint[]
}

type ChartCandle = CandlePoint & { label: string }

interface CandlestickLayerProps {
  data: ChartCandle[]
}

function CandleTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartCandle }>
}) {
  if (!active || !payload?.length) return null
  const candle = payload[0].payload
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs"
      style={{
        borderColor: chartTheme.tooltipBorder,
        backgroundColor: chartTheme.tooltipBg,
        color: chartTheme.tooltipText,
      }}
    >
      <p className="mb-1 font-medium">{candle.label}</p>
      <p>O {formatCurrency(candle.open)}</p>
      <p>H {formatCurrency(candle.high)}</p>
      <p>L {formatCurrency(candle.low)}</p>
      <p>C {formatCurrency(candle.close)}</p>
      <p>Vol {formatNumber(candle.volume)}</p>
    </div>
  )
}

function CandlestickLayer({ data }: CandlestickLayerProps) {
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()

  if (!xScale || !yScale || data.length === 0) return null

  return (
    <g>
      {data.map((candle) => {
        const xStart = xScale(candle.label, { position: 'start' })
        const xEnd = xScale(candle.label, { position: 'end' })
        const yHigh = yScale(candle.high)
        const yLow = yScale(candle.low)
        const yOpen = yScale(candle.open)
        const yClose = yScale(candle.close)

        if (
          xStart === undefined ||
          xEnd === undefined ||
          yHigh === undefined ||
          yLow === undefined ||
          yOpen === undefined ||
          yClose === undefined
        ) {
          return null
        }

        const x = (xStart + xEnd) / 2
        const barWidth = Math.max(Math.abs(xEnd - xStart) * 0.7, 3)
        const isUp = candle.close >= candle.open
        const color = isUp ? chartTheme.candleUp : chartTheme.candleDown
        const bodyTop = Math.min(yOpen, yClose)
        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1)

        return (
          <g key={candle.date}>
            <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth={1} />
            <rect
              x={x - barWidth / 2}
              y={bodyTop}
              width={barWidth}
              height={bodyHeight}
              fill={color}
            />
          </g>
        )
      })}
    </g>
  )
}

export function CandlestickChart({ candles }: CandlestickChartProps) {
  const data: ChartCandle[] = candles.map((candle) => ({
    ...candle,
    label: new Date(candle.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No candle data available.</p>
  }

  const yMin = Math.min(...data.map((c) => c.low))
  const yMax = Math.max(...data.map((c) => c.high))
  const yPadding = (yMax - yMin) * 0.05 || 1

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: chartTheme.axis }}
          stroke={chartTheme.axis}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[yMin - yPadding, yMax + yPadding]}
          tick={{ fontSize: 11, fill: chartTheme.axis }}
          stroke={chartTheme.axis}
          tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
          width={56}
        />
        <Tooltip content={<CandleTooltip />} cursor={{ stroke: chartTheme.grid }} />
        <Bar dataKey="close" fill="transparent" stroke="transparent" isAnimationActive={false} />
        <CandlestickLayer data={data} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
