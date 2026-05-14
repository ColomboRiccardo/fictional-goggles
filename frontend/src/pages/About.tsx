export function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">About Fictional Goggles</h1>
        <p className="mt-2 text-slate-300">
          A demo stock portfolio app built to showcase a modern full-stack architecture
          with React, Python, and Google Cloud.
        </p>
      </div>

      <section className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Tech Stack</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-blue-400">Frontend</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>React 18 + TypeScript</li>
              <li>Vite</li>
              <li>Tailwind CSS</li>
              <li>Recharts</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-emerald-400">Backend</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>Python FastAPI</li>
              <li>Pydantic</li>
              <li>yfinance</li>
              <li>Firestore</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-400">Google Cloud</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>Cloud Run</li>
              <li>Firestore</li>
              <li>Artifact Registry</li>
              <li>Cloud Build</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Architecture</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
{`Browser (React SPA)
    │
    ├── Cloud Run (Frontend) ── nginx + static build
    │
    └── Cloud Run (Backend) ── FastAPI
            │
            ├── Firestore (holdings + quote cache)
            └── Yahoo Finance (via yfinance)`}
        </pre>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Features</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-300">
          <li>Live stock quotes with 15-minute Firestore caching</li>
          <li>Portfolio summary with P&L and day change</li>
          <li>Allocation pie chart and value history</li>
          <li>Dashboard news carousel with mixed headlines across holdings</li>
          <li>Per-stock detail pages with fundamentals and headline news</li>
          <li>OHLC candlestick charts with period selection</li>
          <li>Dark mode UI throughout the app</li>
          <li>Docker Compose for local development</li>
        </ul>
      </section>

      <p className="text-sm text-slate-500">
        Built by Colombo Riccardo — demo portfolio data only, not financial advice.
      </p>
    </div>
  )
}
