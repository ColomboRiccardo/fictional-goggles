from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


class Holding(BaseModel):
    symbol: str
    shares: float
    avg_cost: float
    purchase_date: date


class Quote(BaseModel):
    symbol: str
    price: float
    previous_close: float
    change: float
    change_percent: float
    company_name: Optional[str] = None
    updated_at: datetime


class HoldingWithQuote(Holding):
    company_name: Optional[str] = None
    current_price: float
    market_value: float
    cost_basis: float
    pnl: float
    pnl_percent: float
    day_change: float
    day_change_percent: float


class PortfolioSummary(BaseModel):
    total_value: float
    total_cost: float
    total_pnl: float
    total_pnl_percent: float
    day_change: float
    day_change_percent: float
    holdings_count: int
    last_updated: datetime


class PricePoint(BaseModel):
    date: date
    value: float


class PortfolioHistory(BaseModel):
    period: str
    points: List[PricePoint]


class CandlePoint(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: float


class CandleHistory(BaseModel):
    symbol: str
    period: str
    candles: List[CandlePoint]


class StockDetail(BaseModel):
    symbol: str
    company_name: Optional[str] = None
    price: float
    previous_close: float
    change: float
    change_percent: float
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    holding: Optional[Holding] = None


class NewsItem(BaseModel):
    title: str
    publisher: Optional[str] = None
    link: str
    published_at: Optional[datetime] = None
    thumbnail_url: Optional[str] = None
    symbol: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "fictional-goggles-api"
