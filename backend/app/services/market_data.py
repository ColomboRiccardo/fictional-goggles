from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

import requests
import yfinance as yf

from app.config import settings
from app.models.schemas import CandlePoint, NewsItem, PricePoint, Quote
from app.services.firestore_client import get_firestore_client

PERIOD_MAP = {
    "1mo": "1mo",
    "3mo": "3mo",
    "1y": "1y",
}

COMPANY_NAMES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "GOOGL": "Alphabet Inc.",
    "NVDA": "NVIDIA Corporation",
    "AMZN": "Amazon.com Inc.",
}

_SESSION = requests.Session()
_SESSION.headers["User-Agent"] = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _cache_ref(symbol: str):
    return get_firestore_client().collection("quote_cache").document(symbol.upper())


def _get_cached_quote(symbol: str):
    doc = _cache_ref(symbol).get()
    if not doc.exists:
        return None

    data = doc.to_dict()
    updated_at = data.get("updated_at")
    if not updated_at:
        return None

    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)

    ttl = timedelta(minutes=settings.quote_cache_ttl_minutes)
    if datetime.now(timezone.utc) - updated_at > ttl:
        return None

    return Quote(
        symbol=symbol.upper(),
        price=data["price"],
        previous_close=data["previous_close"],
        change=data["change"],
        change_percent=data["change_percent"],
        company_name=data.get("company_name"),
        updated_at=updated_at,
    )


def _save_quote_cache(quote: Quote) -> None:
    _cache_ref(quote.symbol).set(
        {
            "price": quote.price,
            "previous_close": quote.previous_close,
            "change": quote.change,
            "change_percent": quote.change_percent,
            "company_name": quote.company_name,
            "updated_at": quote.updated_at,
        }
    )


def _company_name(symbol: str):
    sym = symbol.upper()
    try:
        info = yf.Ticker(sym, session=_SESSION).info
        return info.get("shortName") or info.get("longName") or COMPANY_NAMES.get(sym)
    except Exception:
        return COMPANY_NAMES.get(sym)


def _quote_from_history(symbol: str) -> Quote:
    sym = symbol.upper()
    hist = yf.download(sym, period="5d", progress=False, auto_adjust=True, session=_SESSION)

    if hist.empty:
        raise RuntimeError(f"No price data available for {sym}")

    closes = hist["Close"]
    if hasattr(closes, "columns"):
        closes = closes.iloc[:, 0]

    price = float(closes.iloc[-1])
    previous_close = float(closes.iloc[-2]) if len(closes) > 1 else price
    change = price - previous_close
    change_percent = (change / previous_close * 100) if previous_close else 0.0

    quote = Quote(
        symbol=sym,
        price=round(price, 2),
        previous_close=round(previous_close, 2),
        change=round(change, 2),
        change_percent=round(change_percent, 2),
        company_name=_company_name(sym),
        updated_at=datetime.now(timezone.utc),
    )
    _save_quote_cache(quote)
    return quote


def get_quote(symbol: str) -> Quote:
    cached = _get_cached_quote(symbol)
    if cached:
        return cached
    return _quote_from_history(symbol)


def get_quotes(symbols: list[str]) -> dict[str, Quote]:
    quotes: dict[str, Quote] = {}
    to_fetch: list[str] = []

    for symbol in symbols:
        sym = symbol.upper()
        cached = _get_cached_quote(sym)
        if cached:
            quotes[sym] = cached
        else:
            to_fetch.append(sym)

    for symbol in to_fetch:
        quotes[symbol] = _quote_from_history(symbol)

    return quotes


def get_stock_info(symbol: str) -> dict:
    sym = symbol.upper()
    quote = get_quote(sym)

    market_cap = None
    pe_ratio = None
    fifty_two_week_high = None
    fifty_two_week_low = None
    company_name = quote.company_name

    try:
        info = yf.Ticker(sym, session=_SESSION).info
        company_name = info.get("shortName") or info.get("longName") or company_name
        market_cap = info.get("marketCap")
        pe_ratio = info.get("trailingPE")
        fifty_two_week_high = info.get("fiftyTwoWeekHigh")
        fifty_two_week_low = info.get("fiftyTwoWeekLow")
    except Exception:
        pass

    return {
        "symbol": sym,
        "company_name": company_name,
        "price": quote.price,
        "previous_close": quote.previous_close,
        "change": quote.change,
        "change_percent": quote.change_percent,
        "market_cap": market_cap,
        "pe_ratio": pe_ratio,
        "fifty_two_week_high": fifty_two_week_high,
        "fifty_two_week_low": fifty_two_week_low,
    }


def get_price_history(symbol: str, period: str = "1mo") -> list[PricePoint]:
    yf_period = PERIOD_MAP.get(period, "1mo")
    sym = symbol.upper()
    hist = yf.download(sym, period=yf_period, progress=False, auto_adjust=True, session=_SESSION)

    if hist.empty:
        return []

    closes = hist["Close"]
    if hasattr(closes, "columns"):
        closes = closes.iloc[:, 0]

    points: list[PricePoint] = []
    for index, value in closes.items():
        points.append(
            PricePoint(
                date=index.date(),
                value=round(float(value), 2),
            )
        )
    return points


def _ohlc_column(hist, column: str):
    series = hist[column]
    if hasattr(series, "columns"):
        series = series.iloc[:, 0]
    return series


def get_candle_history(symbol: str, period: str = "1mo") -> list[CandlePoint]:
    yf_period = PERIOD_MAP.get(period, "1mo")
    sym = symbol.upper()
    hist = yf.download(
        sym,
        period=yf_period,
        progress=False,
        auto_adjust=True,
        session=_SESSION,
    )

    if hist.empty:
        return []

    opens = _ohlc_column(hist, "Open")
    highs = _ohlc_column(hist, "High")
    lows = _ohlc_column(hist, "Low")
    closes = _ohlc_column(hist, "Close")
    volumes = _ohlc_column(hist, "Volume")

    candles: list[CandlePoint] = []
    for index in hist.index:
        candles.append(
            CandlePoint(
                date=index.date(),
                open=round(float(opens.loc[index]), 2),
                high=round(float(highs.loc[index]), 2),
                low=round(float(lows.loc[index]), 2),
                close=round(float(closes.loc[index]), 2),
                volume=round(float(volumes.loc[index]), 0),
            )
        )
    return candles


def _parse_news_item(raw: dict) -> NewsItem | None:
    content = raw.get("content", raw)

    title = content.get("title")
    if not title:
        return None

    publisher = None
    provider = content.get("provider") or raw.get("publisher")
    if isinstance(provider, dict):
        publisher = provider.get("displayName")
    elif isinstance(provider, str):
        publisher = provider

    link = None
    for key in ("clickThroughUrl", "canonicalUrl"):
        url_obj = content.get(key)
        if isinstance(url_obj, dict) and url_obj.get("url"):
            link = url_obj["url"]
            break
    if not link:
        link = raw.get("link")
    if not link:
        return None

    published_at = None
    pub_date = content.get("pubDate")
    if pub_date:
        try:
            published_at = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
        except ValueError:
            pass
    elif raw.get("providerPublishTime"):
        published_at = datetime.fromtimestamp(raw["providerPublishTime"], tz=timezone.utc)

    thumbnail_url = None
    thumb = content.get("thumbnail") or raw.get("thumbnail")
    if isinstance(thumb, dict):
        thumbnail_url = thumb.get("originalUrl")
        if not thumbnail_url:
            resolutions = thumb.get("resolutions") or []
            if resolutions:
                thumbnail_url = resolutions[0].get("url")

    return NewsItem(
        title=title,
        publisher=publisher,
        link=link,
        published_at=published_at,
        thumbnail_url=thumbnail_url,
    )


def get_stock_news(symbol: str) -> list[NewsItem]:
    sym = symbol.upper()
    try:
        raw_news = yf.Ticker(sym).news or []
    except Exception:
        return []

    items: list[NewsItem] = []
    for raw in raw_news:
        item = _parse_news_item(raw)
        if item:
            items.append(item)
    return items


def get_portfolio_news(symbols: list[str], limit: int = 10) -> list[NewsItem]:
    by_symbol: dict[str, list[NewsItem]] = {}
    seen_links: set[str] = set()

    for symbol in symbols:
        sym = symbol.upper()
        items: list[NewsItem] = []
        for item in get_stock_news(sym):
            if item.link in seen_links:
                continue
            seen_links.add(item.link)
            items.append(item.model_copy(update={"symbol": sym}))
        items.sort(
            key=lambda x: x.published_at or datetime.min.replace(tzinfo=timezone.utc),
            reverse=True,
        )
        if items:
            by_symbol[sym] = items

    if not by_symbol:
        return []

    result: list[NewsItem] = []
    indices = {sym: 0 for sym in by_symbol}
    symbol_order = list(by_symbol.keys())
    random.shuffle(symbol_order)

    while len(result) < limit and any(
        indices[sym] < len(by_symbol[sym]) for sym in symbol_order
    ):
        for sym in symbol_order:
            if len(result) >= limit:
                break
            idx = indices[sym]
            if idx < len(by_symbol[sym]):
                result.append(by_symbol[sym][idx])
                indices[sym] += 1

    return result
