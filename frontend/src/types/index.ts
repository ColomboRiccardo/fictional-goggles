export interface HoldingBase {
  symbol: string
  shares: number
  avg_cost: number
  purchase_date: string
}

export interface Holding extends HoldingBase {
  company_name?: string | null
  current_price: number
  market_value: number
  cost_basis: number
  pnl: number
  pnl_percent: number
  day_change: number
  day_change_percent: number
}

export interface PortfolioSummary {
  total_value: number
  total_cost: number
  total_pnl: number
  total_pnl_percent: number
  day_change: number
  day_change_percent: number
  holdings_count: number
  last_updated: string
}

export interface PricePoint {
  date: string
  value: number
}

export interface PortfolioHistory {
  period: string
  points: PricePoint[]
}

export interface StockDetail {
  symbol: string
  company_name?: string | null
  price: number
  previous_close: number
  change: number
  change_percent: number
  market_cap?: number | null
  pe_ratio?: number | null
  fifty_two_week_high?: number | null
  fifty_two_week_low?: number | null
  holding?: HoldingBase | null
}

export type Period = '1mo' | '3mo' | '1y'

export interface CandlePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CandleHistory {
  symbol: string
  period: string
  candles: CandlePoint[]
}

export interface NewsItem {
  title: string
  publisher?: string | null
  link: string
  published_at?: string | null
  thumbnail_url?: string | null
  symbol?: string | null
}
