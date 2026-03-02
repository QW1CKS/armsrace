-- Migration 002: Additional performance indices
CREATE INDEX IF NOT EXISTS idx_signals_ingested ON signals(ingested_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_geo      ON signals(lat, lon) WHERE lat IS NOT NULL;
