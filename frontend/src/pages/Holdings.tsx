import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { ErrorState } from '../components/ErrorState'
import { HoldingsTable } from '../components/HoldingsTable'
import { LoadingState } from '../components/LoadingState'
import type { Holding } from '../types'

export function Holdings() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getPortfolio()
      setHoldings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load holdings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <LoadingState message="Loading holdings..." />
  if (error) return <ErrorState message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Holdings</h1>
        <p className="mt-1 text-sm text-slate-400">
          {holdings.length} positions in your demo portfolio
        </p>
      </div>
      <HoldingsTable holdings={holdings} />
    </div>
  )
}
