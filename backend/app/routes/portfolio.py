from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import HoldingWithQuote, NewsItem, PortfolioHistory, PortfolioSummary
from app.services.market_data import get_portfolio_news
from app.services.portfolio import (
    get_enriched_holdings,
    get_portfolio_history,
    get_portfolio_summary,
)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

VALID_PERIODS = {"1mo", "3mo", "1y"}


@router.get("", response_model=list[HoldingWithQuote])
def get_portfolio() -> list[HoldingWithQuote]:
    try:
        holdings = get_enriched_holdings()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not holdings:
        raise HTTPException(status_code=404, detail="Portfolio not found. Run seed script.")
    return holdings


@router.get("/summary", response_model=PortfolioSummary)
def get_summary() -> PortfolioSummary:
    try:
        return get_portfolio_summary()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/history", response_model=PortfolioHistory)
def get_history(
    period: str = Query("1mo", description="Time period: 1mo, 3mo, or 1y"),
) -> PortfolioHistory:
    if period not in VALID_PERIODS:
        raise HTTPException(status_code=400, detail=f"Invalid period. Use one of: {VALID_PERIODS}")
    return get_portfolio_history(period)


@router.get("/news", response_model=list[NewsItem])
def get_news() -> list[NewsItem]:
    try:
        holdings = get_enriched_holdings()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not holdings:
        raise HTTPException(status_code=404, detail="Portfolio not found. Run seed script.")
    symbols = [h.symbol for h in holdings]
    return get_portfolio_news(symbols, limit=10)
