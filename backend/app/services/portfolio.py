from __future__ import annotations

from datetime import date, datetime, timezone

import pandas as pd

from app.models.schemas import (
    Holding,
    HoldingWithQuote,
    PortfolioHistory,
    PortfolioSummary,
    PricePoint,
    StockDetail,
)
from app.services.firestore_client import get_firestore_client
from app.services.market_data import get_price_history, get_quotes, get_stock_info


def _get_holdings() -> list[Holding]:
    db = get_firestore_client()
    holdings_ref = (
        db.collection("portfolios").document("demo").collection("holdings")
    )
    holdings: list[Holding] = []

    for doc in holdings_ref.stream():
        data = doc.to_dict()
        purchase_date = data["purchase_date"]
        if isinstance(purchase_date, str):
            purchase_date = date.fromisoformat(purchase_date)

        holdings.append(
            Holding(
                symbol=data["symbol"],
                shares=float(data["shares"]),
                avg_cost=float(data["avg_cost"]),
                purchase_date=purchase_date,
            )
        )

    return holdings


def get_enriched_holdings() -> list[HoldingWithQuote]:
    holdings = _get_holdings()
    if not holdings:
        return []

    quotes = get_quotes([h.symbol for h in holdings])
    enriched: list[HoldingWithQuote] = []

    for holding in holdings:
        quote = quotes[holding.symbol]
        market_value = holding.shares * quote.price
        cost_basis = holding.shares * holding.avg_cost
        pnl = market_value - cost_basis
        pnl_percent = (pnl / cost_basis * 100) if cost_basis else 0.0
        day_change = holding.shares * quote.change
        day_change_percent = quote.change_percent

        enriched.append(
            HoldingWithQuote(
                **holding.model_dump(),
                company_name=quote.company_name,
                current_price=quote.price,
                market_value=round(market_value, 2),
                cost_basis=round(cost_basis, 2),
                pnl=round(pnl, 2),
                pnl_percent=round(pnl_percent, 2),
                day_change=round(day_change, 2),
                day_change_percent=round(day_change_percent, 2),
            )
        )

    return enriched


def get_portfolio_summary() -> PortfolioSummary:
    holdings = get_enriched_holdings()
    total_value = sum(h.market_value for h in holdings)
    total_cost = sum(h.cost_basis for h in holdings)
    total_pnl = total_value - total_cost
    total_pnl_percent = (total_pnl / total_cost * 100) if total_cost else 0.0
    day_change = sum(h.day_change for h in holdings)
    previous_value = total_value - day_change
    day_change_percent = (day_change / previous_value * 100) if previous_value else 0.0

    return PortfolioSummary(
        total_value=round(total_value, 2),
        total_cost=round(total_cost, 2),
        total_pnl=round(total_pnl, 2),
        total_pnl_percent=round(total_pnl_percent, 2),
        day_change=round(day_change, 2),
        day_change_percent=round(day_change_percent, 2),
        holdings_count=len(holdings),
        last_updated=datetime.now(timezone.utc),
    )


def get_portfolio_history(period: str = "1mo") -> PortfolioHistory:
    holdings = _get_holdings()
    if not holdings:
        return PortfolioHistory(period=period, points=[])

    frames: list[pd.DataFrame] = []
    for holding in holdings:
        history = get_price_history(holding.symbol, period)
        if not history:
            continue

        df = pd.DataFrame(
            [{"date": p.date, "value": p.value * holding.shares} for p in history]
        )
        df["date"] = pd.to_datetime(df["date"])
        frames.append(df.set_index("date"))

    if not frames:
        return PortfolioHistory(period=period, points=[])

    combined = pd.concat(frames, axis=1).ffill().fillna(0)
    combined["total"] = combined.sum(axis=1)

    points = [
        PricePoint(date=index.date(), value=round(float(row["total"]), 2))
        for index, row in combined.iterrows()
    ]

    return PortfolioHistory(period=period, points=points)


def get_stock_detail(symbol: str) -> StockDetail:
    info = get_stock_info(symbol)
    holdings = _get_holdings()
    holding = next((h for h in holdings if h.symbol == symbol.upper()), None)

    return StockDetail(
        symbol=info["symbol"],
        company_name=info.get("company_name"),
        price=info["price"],
        previous_close=info["previous_close"],
        change=info["change"],
        change_percent=info["change_percent"],
        market_cap=info.get("market_cap"),
        pe_ratio=info.get("pe_ratio"),
        fifty_two_week_high=info.get("fifty_two_week_high"),
        fifty_two_week_low=info.get("fifty_two_week_low"),
        holding=holding,
    )
