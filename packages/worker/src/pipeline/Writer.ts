import type { Signal } from '@armsrace/shared';
import { getDb } from '../db/client.js';
import { logger } from '../logger.js';

const BATCH_SIZE = 100;

/** Persists signals to SQLite in batches */
export class Writer {
  writeSignals(signals: Signal[]): number {
    if (signals.length === 0) return 0;
    const db = getDb();

    const insert = db.prepare(`
      INSERT OR IGNORE INTO signals
        (id, source_id, category, subcategory, title, summary,
         severity, confidence, lat, lon, country_code, region,
         url, raw_json, published_at, ingested_at, is_stale)
      VALUES
        (@id, @sourceId, @category, @subcategory, @title, @summary,
         @severity, @confidence, @lat, @lon, @countryCode, @region,
         @url, @rawJson, @publishedAt, @ingestedAt, 0)
    `);

    const insertMany = db.transaction((batch: Signal[]) => {
      let count = 0;
      for (const s of batch) {
        const result = insert.run({
          id: s.id,
          sourceId: s.sourceId,
          category: s.category,
          subcategory: s.subcategory ?? null,
          title: s.title,
          summary: s.summary ?? null,
          severity: s.severity,
          confidence: s.confidence,
          lat: s.lat ?? null,
          lon: s.lon ?? null,
          countryCode: s.countryCode ?? null,
          region: s.region ?? null,
          url: s.url ?? null,
          rawJson: s.rawJson ? JSON.stringify(s.rawJson) : null,
          publishedAt: s.publishedAt.getTime(),
          ingestedAt: Date.now(),
        });
        if (result.changes > 0) count++;
      }
      return count;
    });

    let total = 0;
    for (let i = 0; i < signals.length; i += BATCH_SIZE) {
      total += insertMany(signals.slice(i, i + BATCH_SIZE));
    }

    return total;
  }

  writeGeoEvents(signals: Signal[]): void {
    const db = getDb();
    const geoSignals = signals.filter((s) => s.lat != null && s.lon != null);
    if (geoSignals.length === 0) return;

    const insert = db.prepare(`
      INSERT OR IGNORE INTO geo_events (id, signal_id, lat, lon, magnitude, event_type, timestamp)
      VALUES (@id, @signalId, @lat, @lon, @magnitude, @eventType, @timestamp)
    `);

    const insertMany = db.transaction((batch: Signal[]) => {
      for (const s of batch) {
        insert.run({
          id: `geo_${s.id}`,
          signalId: s.id,
          lat: s.lat,
          lon: s.lon,
          magnitude: s.severity / 20, // normalize severity to 0-5 magnitude
          eventType: s.subcategory ?? s.category,
          timestamp: s.publishedAt.getTime(),
        });
      }
    });

    insertMany(geoSignals);
  }

  updateSourceHealth(
    sourceId: string,
    status: 'ok' | 'error' | 'rate_limited',
    signalCount: number,
    errorMsg?: string,
  ): void {
    const db = getDb();
    const now = Date.now();

    db.prepare(`
      INSERT INTO source_health (source_id, last_fetch_at, last_success_at, status, error_msg, total_fetches, total_signals)
      VALUES (@sourceId, @now, @successAt, @status, @errorMsg, 1, @signalCount)
      ON CONFLICT(source_id) DO UPDATE SET
        last_fetch_at   = @now,
        last_success_at = CASE WHEN @status = 'ok' THEN @now ELSE last_success_at END,
        status          = @status,
        error_msg       = @errorMsg,
        total_fetches   = total_fetches + 1,
        total_signals   = total_signals + @signalCount
    `).run({
      sourceId,
      now,
      successAt: status === 'ok' ? now : null,
      status,
      errorMsg: errorMsg ?? null,
      signalCount,
    });
  }

  queueSseEvent(eventType: string, payload: unknown): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO sse_queue (event_type, payload) VALUES (?, ?)
    `).run(eventType, JSON.stringify(payload));
  }
}
