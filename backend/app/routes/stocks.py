from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import CandleHistory, NewsItem, PortfolioHistory, StockDetail
from app.services.market_data import get_candle_history, get_price_history, get_stock_news
from app.services.portfolio import get_stock_detail

router = APIRouter(prefix="/stocks", tags=["stocks"])

VALID_PERIODS = {"1mo", "3mo", "1y"}


@router.get("/{symbol}", response_model=StockDetail)
def get_stock(symbol: str) -> StockDetail:
    try:
        return get_stock_detail(symbol)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=f"Stock not found: {symbol}") from exc


@router.get("/{symbol}/history", response_model=PortfolioHistory)
def get_stock_history(
    symbol: str,
    period: str = Query("1mo", description="Time period: 1mo, 3mo, or 1y"),
) -> PortfolioHistory:
    if period not in VALID_PERIODS:
        raise HTTPException(status_code=400, detail=f"Invalid period. Use one of: {VALID_PERIODS}")

    points = get_price_history(symbol, period)
    if not points:
        raise HTTPException(status_code=404, detail=f"No history found for: {symbol}")

    return PortfolioHistory(period=period, points=points)


@router.get("/{symbol}/candles", response_model=CandleHistory)
def get_stock_candles(
    symbol: str,
    period: str = Query("1mo", description="Time period: 1mo, 3mo, or 1y"),
) -> CandleHistory:
    if period not in VALID_PERIODS:
        raise HTTPException(status_code=400, detail=f"Invalid period. Use one of: {VALID_PERIODS}")

    candles = get_candle_history(symbol, period)
    if not candles:
        raise HTTPException(status_code=404, detail=f"No candle data found for: {symbol}")

    return CandleHistory(symbol=symbol.upper(), period=period, candles=candles)


@router.get("/{symbol}/news", response_model=list[NewsItem])
def get_stock_news_route(symbol: str) -> list[NewsItem]:
    try:
        return get_stock_news(symbol)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"News temporarily unavailable for: {symbol.upper()}",
        ) from exc
