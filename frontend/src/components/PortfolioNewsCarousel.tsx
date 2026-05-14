import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { NewsItem } from '../types'
import { formatRelativeDate } from '../utils/format'

function NewsCardSkeleton() {
  return (
    <div className="w-72 shrink-0 snap-start rounded-xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex gap-3">
        <div className="h-16 w-20 shrink-0 animate-pulse rounded-md bg-slate-800" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-12 animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
        </div>
      </div>
    </div>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="group w-72 shrink-0 snap-start rounded-xl border border-slate-700 bg-slate-900 p-4 transition-colors hover:border-slate-600">
      <div className="flex gap-3">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt=""
            className="h-16 w-20 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs text-slate-500">
            News
          </div>
        )}
        <div className="min-w-0 flex-1">
          {item.symbol && (
            <Link
              to={`/stocks/${item.symbol}`}
              onClick={(e) => e.stopPropagation()}
              className="mb-1.5 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:bg-slate-700"
            >
              {item.symbol}
            </Link>
          )}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-3 text-sm font-medium leading-snug text-slate-100 group-hover:text-blue-400"
          >
            {item.title}
          </a>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            {item.publisher && <span>{item.publisher}</span>}
            {item.publisher && item.published_at && <span aria-hidden="true">·</span>}
            {item.published_at && (
              <time dateTime={item.published_at}>{formatRelativeDate(item.published_at)}</time>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function PortfolioNewsCarousel() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api
      .getPortfolioNews()
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false))
  }, [])

  const scroll = useCallback((direction: 'prev' | 'next') => {
    const el = scrollRef.current
    if (!el) return
    const amount = direction === 'next' ? 300 : -300
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }, [])

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Market News</h2>
        {!loading && news.length > 0 && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scroll('prev')}
              aria-label="Previous news"
              className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scroll('next')}
              aria-label="Next news"
              className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <p className="text-sm text-slate-400">No recent news available for portfolio holdings.</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {news.map((item) => (
            <NewsCard key={item.link} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
