# Armsrace Monitor

A localhost-only, real-time geopolitical intelligence and market risk dashboard.
Aggregates open-source signals across 30+ data sources into a unified dark-mode UI.

> **Disclaimer**: Armsrace Monitor provides informational analytics and scenario modeling only.
> Predictions and forecasts are probabilistic/speculative outputs, not guarantees or advice.
> Always verify critical decisions with primary sources.

---

## Features

- **Mission Control** — Live global risk gauge, heatmap, breaking ticker, and top-moving signals
- **Geopolitics** — Conflict feed, travel advisories, severity-by-country bar chart, region filter
- **Markets** — Equities, FX, metals, crypto, energy prices with Market Stress and Fear & Greed indices
- **Infrastructure** — Internet/cloud anomalies, maritime traffic, aviation disruptions
- **Predictions** — 24h/72h/7d probabilistic scenario forecasts with confidence bars
- **Alerts** — Filterable alert center with acknowledge/dismiss actions and live toast notifications
- **Data Sources** — Per-connector health dashboard (status, last fetch, signal count)
- **Settings** — API key management, notification preferences, data retention

---

## Requirements

- **Node.js** ≥ 18 (with built-in `fetch`)
- **npm** ≥ 9 (workspaces support)
- No Docker, no external database server required

---

## Quick Start

### Windows

```bat
start-armsrace-monitor.bat
```

### Unix / macOS / WSL

```bash
chmod +x start-armsrace-monitor.sh
./start-armsrace-monitor.sh
```

Both scripts:
1. Run `npm install` if `node_modules` is missing
2. Copy `.env.example` → `.env` if `.env` does not exist
3. Start all three processes (`npm run dev`) and open `http://localhost:4010`

### Manual startup

```bash
# From repo root
npm install
cp .env.example .env   # edit to add optional API keys
npm run dev
```

---

## Architecture

```
worker (port n/a)       data ingestion + analytics
    │ SQLite WAL writes
    ▼
data/armsrace.db        shared persistence layer
    │ reads
    ▼
api  (port 3001)        REST + SSE endpoints
    │ HTTP + SSE
    ▼
web  (port 4010)        Vite/React dashboard
```

Packages:

| Package | Role |
|---|---|
| `packages/shared` | TypeScript types, constants, utility functions |
| `packages/api` | Express 4, better-sqlite3, REST routes, SSE broadcaster |
| `packages/worker` | 30+ data connectors, analytics pipeline, forecasting |
| `packages/web` | Vite 5 + React 18 + TanStack Query, Recharts, Leaflet |

---

## Configuration

All configuration is via environment variables in `.env` (copy from `.env.example`).

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development` (default) or `production` |
| `DB_PATH` | No | SQLite file path (default: `./data/armsrace.db`) |
| `REDIS_URL` | No | Redis pub/sub for ~100ms SSE latency (default: 5s polling fallback) |
| `OPEN_BROWSER` | No | `true` to auto-open browser on start |
| `ACLED_API_KEY` + `ACLED_EMAIL` | No | Armed conflict event data (free academic key) |
| `OTX_API_KEY` | No | AlienVault OTX threat intelligence |
| `ABUSEIPDB_API_KEY` | No | IP reputation data |
| `FINNHUB_API_KEY` | No | Real-time stock quotes |
| `FRED_API_KEY` | No | Federal Reserve economic indicators |
| `EIA_API_KEY` | No | US energy price data |
| `NASA_FIRMS_MAP_KEY` | No | NASA fire detection (free key) |
| `CLOUDFLARE_API_TOKEN` | No | Cloudflare Radar internet traffic |
| `TELEGRAM_API_ID` + `TELEGRAM_API_HASH` + `TELEGRAM_SESSION` | No | Telegram channel aggregation |

**All API keys are optional.** The system runs with no-key sources out of the box (USGS, GDELT, CoinGecko, Yahoo Finance, abuse.ch feeds, NASA EONET, travel advisories, 150+ RSS feeds). Key-optional connectors are automatically skipped when their key is absent.

### Telegram Setup (optional)

```bash
cd packages/worker
npm run telegram:auth
```

Follow the interactive prompts. The generated session string goes in `TELEGRAM_SESSION`.

---

## Data Sources

See [DATA_SOURCES.md](DATA_SOURCES.md) for the complete list of all integrated sources.

See [DATA_SOURCE_COMPLIANCE.md](DATA_SOURCE_COMPLIANCE.md) for terms, attribution, and usage policy notes.

---

## Alert Types

Defined in [ALERT_PRESETS.json](ALERT_PRESETS.json):

| Type | Trigger |
|---|---|
| `geopolitical_escalation` | Country conflict severity rises ≥20 pts over 24h |
| `military_posture` | ≥5 military/aviation signals (severity ≥50) in 2h |
| `market_shock` | Asset moves ≥5% or Market Stress Index ≥75 |
| `cyber_spike` | Cyber signals >2× 7-day hourly baseline |
| `infra_disruption` | ≥3 infrastructure signals (severity ≥60) in 1h |
| `convergence` | ≥3 distinct categories elevated in same country within 2h |

---

## Development

```bash
npm run build        # build all packages
npm run typecheck    # TypeScript type-check all packages
```

---

## Security

- API server binds to `127.0.0.1` only (not accessible externally)
- CORS restricted to `http://localhost:4010`
- Helmet security headers enabled
- Rate limiting: 60 req/min per IP
- Input sanitized via zod before any DB queries
- No telemetry, no external CDN assets, no analytics scripts

---

## License

MIT

Data ingested from third-party sources is subject to the respective provider's terms of service.
Refer to [DATA_SOURCE_COMPLIANCE.md](DATA_SOURCE_COMPLIANCE.md) for details.
