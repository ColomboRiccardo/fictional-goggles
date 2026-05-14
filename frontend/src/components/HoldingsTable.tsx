import { Link } from 'react-router-dom'
import type { Holding } from '../types'
import { formatCurrency, formatPercent, pnlColor } from '../utils/format'

interface HoldingsTableProps {
  holdings: Holding[]
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50 text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3 text-right">Shares</th>
            <th className="px-4 py-3 text-right">Avg Cost</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">Value</th>
            <th className="px-4 py-3 text-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.symbol} className="border-b border-slate-800 hover:bg-slate-800/50">
              <td className="px-4 py-3">
                <Link
                  to={`/stocks/${holding.symbol}`}
                  className="font-semibold text-blue-400 hover:text-blue-300"
                >
                  {holding.symbol}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-300">{holding.company_name || '—'}</td>
              <td className="px-4 py-3 text-right">{holding.shares}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(holding.avg_cost)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(holding.current_price)}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(holding.market_value)}</td>
              <td className={`px-4 py-3 text-right font-medium ${pnlColor(holding.pnl)}`}>
                {formatCurrency(holding.pnl)}
                <span className="ml-1 text-xs">({formatPercent(holding.pnl_percent)})</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
