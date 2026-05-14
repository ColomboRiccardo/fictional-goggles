import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { CandlestickChart } from '../components/CandlestickChart'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { PeriodToggle } from '../components/PeriodToggle'
import type { CandlePoint, Period } from '../types'
import { formatCurrency } from '../utils/format'

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMZN'] as const

export function Charts() {
  const [symbol, setSymbol] = useState<string>(SYMBOLS[0])
  const [period, setPeriod] = useState<Period>('1mo')
  const [candles, setCandles] = useState<CandlePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getStockCandles(symbol, period)
      setCandles(data.candles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }, [symbol, period])

  useEffect(() => {
    loadData()
  }, [loadData])

  const latest = candles[candles.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Charts</h1>
        <p className="mt-1 text-sm text-slate-400">
          OHLC candlestick charts for portfolio holdings
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 p-1">
          {SYMBOLS.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setSymbol(sym)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                symbol === sym
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {loading && candles.length === 0 ? (
        <LoadingState message="Loading chart data..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">{symbol}</h2>
              {latest && (
                <p className="mt-1 text-xs text-slate-400">
                  O {formatCurrency(latest.open)} · H {formatCurrency(latest.high)} · L{' '}
                  {formatCurrency(latest.low)} · C {formatCurrency(latest.close)}
                </p>
              )}
            </div>
            {latest && (
              <p className="text-lg font-semibold text-slate-100">
                {formatCurrency(latest.close)}
              </p>
            )}
          </div>
          <CandlestickChart candles={candles} />
        </div>
      )}
    </div>
  )
}
