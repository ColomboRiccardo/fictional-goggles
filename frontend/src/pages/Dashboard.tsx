import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { AllocationChart } from '../components/AllocationChart'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { PeriodToggle } from '../components/PeriodToggle'
import { PortfolioChart } from '../components/PortfolioChart'
import { PortfolioNewsCarousel } from '../components/PortfolioNewsCarousel'
import { StatCard } from '../components/StatCard'
import type { Holding, Period, PortfolioSummary } from '../types'
import { formatCurrency, formatPercent } from '../utils/format'

export function Dashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [history, setHistory] = useState<{ date: string; value: number }[]>([])
  const [period, setPeriod] = useState<Period>('1mo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryData, holdingsData, historyData] = await Promise.all([
        api.getSummary(),
        api.getPortfolio(),
        api.getHistory(period),
      ])
      setSummary(summaryData)
      setHoldings(holdingsData)
      setHistory(historyData.points)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && !summary) return <LoadingState message="Loading portfolio..." />
  if (error) return <ErrorState message={error} onRetry={loadData} />
  if (!summary) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of your demo portfolio performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Value" value={formatCurrency(summary.total_value)} />
        <StatCard
          label="Day Change"
          value={formatCurrency(summary.day_change)}
          subValue={formatPercent(summary.day_change_percent)}
          subValueNumeric={summary.day_change}
        />
        <StatCard
          label="Total Return"
          value={formatCurrency(summary.total_pnl)}
          subValue={formatPercent(summary.total_pnl_percent)}
          subValueNumeric={summary.total_pnl}
        />
      </div>

      <PortfolioNewsCarousel />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Portfolio Value</h2>
            <PeriodToggle value={period} onChange={setPeriod} />
          </div>
          <PortfolioChart points={history} />
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-100">Allocation</h2>
          <AllocationChart holdings={holdings} />
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {holdings.map((h, i) => (
              <span key={h.symbol} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i % 5] }}
                />
                {h.symbol}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
