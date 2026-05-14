import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { PeriodToggle } from '../components/PeriodToggle'
import { PortfolioChart } from '../components/PortfolioChart'
import { StatCard } from '../components/StatCard'
import type { NewsItem, Period, StockDetail as StockDetailType } from '../types'
import { formatCurrency, formatDate, formatNumber, formatPercent, formatRelativeDate } from '../utils/format'

export function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>()
  const [stock, setStock] = useState<StockDetailType | null>(null)
  const [history, setHistory] = useState<{ date: string; value: number }[]>([])
  const [period, setPeriod] = useState<Period>('1mo')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!symbol) return
    setLoading(true)
    setError(null)
    try {
      const [stockData, historyData] = await Promise.all([
        api.getStock(symbol),
        api.getStockHistory(symbol, period),
      ])
      setStock(stockData)
      setHistory(historyData.points)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock')
    } finally {
      setLoading(false)
    }
  }, [symbol, period])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!symbol) return
    setNewsLoading(true)
    api
      .getStockNews(symbol)
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false))
  }, [symbol])

  if (loading && !stock) return <LoadingState message="Loading stock data..." />
  if (error) return <ErrorState message={error} onRetry={loadData} />
  if (!stock) return null

  return (
    <div className="space-y-6">
      <div>
        <Link to="/holdings" className="text-sm text-blue-400 hover:text-blue-300">
          ← Back to Holdings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">{stock.symbol}</h1>
        <p className="text-sm text-slate-400">{stock.company_name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current Price" value={formatCurrency(stock.price)} />
        <StatCard
          label="Day Change"
          value={formatCurrency(stock.change)}
          subValue={formatPercent(stock.change_percent)}
          subValueNumeric={stock.change}
        />
        {stock.holding && (
          <StatCard
            label="Your Position"
            value={`${stock.holding.shares} shares`}
            subValue={formatCurrency(stock.holding.shares * stock.price)}
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stock.market_cap != null && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400">Market Cap</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{formatNumber(stock.market_cap)}</p>
          </div>
        )}
        {stock.pe_ratio != null && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400">P/E Ratio</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{stock.pe_ratio.toFixed(2)}</p>
          </div>
        )}
        {stock.fifty_two_week_high != null && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400">52W High</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{formatCurrency(stock.fifty_two_week_high)}</p>
          </div>
        )}
        {stock.fifty_two_week_low != null && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400">52W Low</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{formatCurrency(stock.fifty_two_week_low)}</p>
          </div>
        )}
      </div>

      {stock.holding && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-100">Portfolio Position</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-400">Shares</dt>
              <dd className="font-medium text-slate-100">{stock.holding.shares}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Avg Cost</dt>
              <dd className="font-medium text-slate-100">{formatCurrency(stock.holding.avg_cost)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Purchase Date</dt>
              <dd className="font-medium text-slate-100">{formatDate(stock.holding.purchase_date)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Cost Basis</dt>
              <dd className="font-medium text-slate-100">
                {formatCurrency(stock.holding.shares * stock.holding.avg_cost)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Price History</h2>
          <PeriodToggle value={period} onChange={setPeriod} />
        </div>
        <PortfolioChart points={history} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-100">News</h2>
        {newsLoading ? (
          <p className="mt-4 text-sm text-slate-400">Loading news...</p>
        ) : news.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No recent news available for {stock.symbol}.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {news.map((item) => (
              <li
                key={item.link}
                className="flex gap-4 rounded-lg border border-slate-700/60 bg-slate-950/40 p-4 transition-colors hover:border-slate-600"
              >
                {item.thumbnail_url && (
                  <img
                    src={item.thumbnail_url}
                    alt=""
                    className="hidden h-16 w-24 shrink-0 rounded-md object-cover sm:block"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-100 hover:text-blue-400"
                  >
                    {item.title}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                    {item.publisher && <span>{item.publisher}</span>}
                    {item.publisher && item.published_at && <span aria-hidden="true">·</span>}
                    {item.published_at && <time dateTime={item.published_at}>{formatRelativeDate(item.published_at)}</time>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
