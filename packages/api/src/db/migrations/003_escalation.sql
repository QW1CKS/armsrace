-- Migration 003: Escalation scores table
CREATE TABLE IF NOT EXISTS escalation_scores (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  country_code TEXT    NOT NULL,
  country_name TEXT    NOT NULL,
  score        REAL    NOT NULL,
  trend        TEXT    NOT NULL DEFAULT 'stable',
  delta_24h    REAL    NOT NULL DEFAULT 0,
  top_signals  TEXT    NOT NULL DEFAULT '[]',
  computed_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_esc_country_at ON escalation_scores(country_code, computed_at DESC);
