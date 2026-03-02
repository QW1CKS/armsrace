-- Migration 001: Initial schema
-- Enable WAL mode for concurrent reads/writes (worker writes, API reads)
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA synchronous=NORMAL;

-- ── Signals ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
  id           TEXT    PRIMARY KEY,
  source_id    TEXT    NOT NULL,
  category     TEXT    NOT NULL,
  subcategory  TEXT,
  title        TEXT    NOT NULL,
  summary      TEXT,
  severity     INTEGER NOT NULL DEFAULT 0,    -- 0-100
  confidence   REAL    NOT NULL DEFAULT 0.5,  -- 0.0-1.0
  lat          REAL,
  lon          REAL,
  country_code TEXT,
  region       TEXT,
  url          TEXT,
  raw_json     TEXT,
  published_at INTEGER NOT NULL,              -- unix epoch ms
  ingested_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  is_stale     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_signals_cat_pub     ON signals(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_country_pub ON signals(country_code, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_severity    ON signals(severity DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_source      ON signals(source_id, published_at DESC);

-- ── Alerts ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id              TEXT    PRIMARY KEY,
  type            TEXT    NOT NULL,
  severity        INTEGER NOT NULL,
  confidence      REAL    NOT NULL,
  title           TEXT    NOT NULL,
  body            TEXT    NOT NULL,
  sources_json    TEXT    NOT NULL DEFAULT '[]',
  entities_json   TEXT    NOT NULL DEFAULT '[]',
  signal_ids      TEXT    NOT NULL DEFAULT '[]',
  triggered_at    INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  acknowledged_at INTEGER,
  dismissed_at    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type      ON alerts(type, triggered_at DESC);

-- ── SSE Queue ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sse_queue (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT    NOT NULL,
  payload    TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  sent       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sse_queue_sent ON sse_queue(sent, created_at);

-- ── Composite Indices ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS indices (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  value       REAL    NOT NULL,
  components  TEXT    NOT NULL DEFAULT '{}',
  computed_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_indices_name_at ON indices(name, computed_at DESC);

-- ── Market Snapshots ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_snapshots (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol      TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  asset_class TEXT    NOT NULL,
  price       REAL    NOT NULL,
  change_24h  REAL,
  change_pct  REAL,
  volume      REAL,
  extra_json  TEXT,
  snapshot_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_mkt_symbol_at ON market_snapshots(symbol, snapshot_at DESC);

-- ── Geo Events (heatmap) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS geo_events (
  id         TEXT    PRIMARY KEY,
  signal_id  TEXT    NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  lat        REAL    NOT NULL,
  lon        REAL    NOT NULL,
  magnitude  REAL    NOT NULL DEFAULT 1.0,
  event_type TEXT    NOT NULL,
  timestamp  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_geo_ts       ON geo_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_geo_type_ts  ON geo_events(event_type, timestamp DESC);

-- ── Source Health ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS source_health (
  source_id       TEXT    PRIMARY KEY,
  last_fetch_at   INTEGER,
  last_success_at INTEGER,
  status          TEXT    NOT NULL DEFAULT 'pending',
  error_msg       TEXT,
  total_fetches   INTEGER NOT NULL DEFAULT 0,
  total_signals   INTEGER NOT NULL DEFAULT 0
);

-- ── Deduplication Hashes ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dedup_hashes (
  hash       TEXT    PRIMARY KEY,
  signal_id  TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- ── Forecasts ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forecasts (
  id            TEXT    PRIMARY KEY,
  horizon       TEXT    NOT NULL,
  subject       TEXT    NOT NULL,
  subject_type  TEXT    NOT NULL,
  probability   REAL    NOT NULL,
  narrative     TEXT    NOT NULL,
  confidence    REAL    NOT NULL,
  signal_basis  TEXT    NOT NULL DEFAULT '[]',
  generated_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_horizon ON forecasts(horizon, generated_at DESC);
