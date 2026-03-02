import { getDb } from '../db/client.js';
import { nanoid } from 'nanoid';
import type { Writer } from '../pipeline/Writer.js';

const WINDOW_MS = 2 * 60 * 60_000; // 2 hours
const MIN_CATEGORIES = 3;
const MIN_SEVERITY = 40;

export class ConvergenceDetector {
  constructor(private writer: Writer) {}

  detect(): void {
    const db = getDb();
    const since = Date.now() - WINDOW_MS;

    // Find regions with signals across multiple categories
    const rows = db.prepare(`
      SELECT
        country_code,
        COUNT(DISTINCT category) as cat_count,
        GROUP_CONCAT(DISTINCT category) as categories,
        AVG(severity) as avg_severity,
        COUNT(*) as signal_count,
        GROUP_CONCAT(id) as signal_ids
      FROM signals
      WHERE published_at > ?
        AND is_stale = 0
        AND country_code IS NOT NULL
        AND country_code != ''
        AND severity >= ?
      GROUP BY country_code
      HAVING cat_count >= ?
      ORDER BY avg_severity DESC
      LIMIT 20
    `).all(since, MIN_SEVERITY, MIN_CATEGORIES) as Array<{
      country_code: string;
      cat_count: number;
      categories: string;
      avg_severity: number;
      signal_count: number;
      signal_ids: string;
    }>;

    for (const row of rows) {
      const signalIds = row.signal_ids.split(',').slice(0, 20);
      const categories = row.categories.split(',');
      const avgSeverity = Math.round(row.avg_severity);

      // Check if we already have a recent convergence alert for this country
      const existing = db.prepare(`
        SELECT 1 FROM alerts
        WHERE type = 'convergence'
          AND json_extract(entities_json, '$[0].name') = ?
          AND triggered_at > ?
      `).get(row.country_code, since);

      if (existing) continue;

      const alertId = nanoid();
      const title = `Multi-Signal Convergence: ${row.country_code}`;
      const body = `${row.cat_count} signal categories (${categories.join(', ')}) are simultaneously elevated in ${row.country_code}. Avg severity: ${avgSeverity}/100 across ${row.signal_count} signals.`;

      db.prepare(`
        INSERT INTO alerts (id, type, severity, confidence, title, body, sources_json, entities_json, signal_ids)
        VALUES (@id, 'convergence', @severity, @confidence, @title, @body, '[]', @entities, @signalIds)
      `).run({
        id: alertId,
        severity: avgSeverity,
        confidence: Math.min(0.95, 0.6 + (row.cat_count - 3) * 0.1),
        title,
        body,
        entities: JSON.stringify([{ name: row.country_code, type: 'country' }]),
        signalIds: JSON.stringify(signalIds),
      });

      this.writer.queueSseEvent('alert', { id: alertId, type: 'convergence', severity: avgSeverity, title });
    }
  }
}
