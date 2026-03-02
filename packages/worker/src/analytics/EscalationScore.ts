import { getDb } from '../db/client.js';
import { clamp } from '@armsrace/shared';

export class EscalationScoreComputer {
  compute(): void {
    const db = getDb();
    const since24h = Date.now() - 24 * 60 * 60_000;
    const since48h = Date.now() - 48 * 60 * 60_000;

    // Get scores for countries active in last 48h
    const countries = db.prepare(`
      SELECT country_code, COUNT(*) as cnt, AVG(severity) as avg_severity
      FROM signals
      WHERE country_code IS NOT NULL
        AND country_code != ''
        AND published_at > ?
        AND category IN ('geo', 'military', 'hazard')
        AND is_stale = 0
      GROUP BY country_code
      HAVING cnt >= 2
      ORDER BY avg_severity DESC
      LIMIT 50
    `).all(since48h) as Array<{ country_code: string; cnt: number; avg_severity: number }>;

    const insert = db.prepare(`
      INSERT INTO escalation_scores
        (country_code, country_name, score, trend, delta_24h, top_signals, computed_at)
      VALUES
        (@countryCode, @countryName, @score, @trend, @delta24h, @topSignals, @computedAt)
    `);

    const insertMany = db.transaction(() => {
      for (const row of countries) {
        // Score for last 24h
        const now24 = db.prepare(`
          SELECT AVG(severity) as avg FROM signals
          WHERE country_code = ? AND published_at > ? AND is_stale = 0
          AND category IN ('geo', 'military', 'hazard')
        `).get(row.country_code, since24h) as { avg: number | null };

        // Score for prior 24h
        const prior24 = db.prepare(`
          SELECT AVG(severity) as avg FROM signals
          WHERE country_code = ? AND published_at BETWEEN ? AND ? AND is_stale = 0
          AND category IN ('geo', 'military', 'hazard')
        `).get(row.country_code, since48h, since24h) as { avg: number | null };

        const score = clamp(Math.round(now24.avg ?? 0), 0, 100);
        const prevScore = clamp(Math.round(prior24.avg ?? 0), 0, 100);
        const delta = score - prevScore;
        const trend = delta > 5 ? 'rising' : delta < -5 ? 'falling' : 'stable';

        // Top signal titles
        const topSignals = db.prepare(`
          SELECT title FROM signals
          WHERE country_code = ? AND published_at > ?
          ORDER BY severity DESC LIMIT 3
        `).all(row.country_code, since24h) as Array<{ title: string }>;

        insert.run({
          countryCode: row.country_code,
          countryName: row.country_code, // Will be resolved on frontend
          score,
          trend,
          delta24h: delta,
          topSignals: JSON.stringify(topSignals.map((s) => s.title)),
          computedAt: Date.now(),
        });
      }
    });

    insertMany();
  }
}
