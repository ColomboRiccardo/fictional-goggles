import type {
  CandleHistory,
  Holding,
  NewsItem,
  Period,
  PortfolioHistory,
  PortfolioSummary,
  StockDetail,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || 'Request failed')
  }
  return response.json()
}

export const api = {
  getPortfolio: () => fetchApi<Holding[]>('/api/portfolio'),
  getSummary: () => fetchApi<PortfolioSummary>('/api/portfolio/summary'),
  getHistory: (period: Period) => fetchApi<PortfolioHistory>(`/api/portfolio/history?period=${period}`),
  getStock: (symbol: string) => fetchApi<StockDetail>(`/api/stocks/${symbol}`),
  getStockHistory: (symbol: string, period: Period) =>
    fetchApi<PortfolioHistory>(`/api/stocks/${symbol}/history?period=${period}`),
  getStockCandles: (symbol: string, period: Period) =>
    fetchApi<CandleHistory>(`/api/stocks/${symbol}/candles?period=${period}`),
  getStockNews: (symbol: string) => fetchApi<NewsItem[]>(`/api/stocks/${symbol}/news`),
  getPortfolioNews: () => fetchApi<NewsItem[]>('/api/portfolio/news'),
}
