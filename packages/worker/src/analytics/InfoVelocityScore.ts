import { getDb } from '../db/client.js';
import { clamp, rollingStats, zScore } from '@armsrace/shared';

export class InfoVelocityScore {
  compute(): number {
    const db = getDb();
    const now = Date.now();

    // Current hour count
    const current = db.prepare(`
      SELECT COUNT(*) as cnt FROM signals WHERE published_at > ? AND is_stale = 0
    `).get(now - 60 * 60_000) as { cnt: number };

    // Baseline: hourly counts over last 7 days
    const hourlyRows = db.prepare(`
      SELECT COUNT(*) as cnt
      FROM signals
      WHERE published_at > ? AND published_at < ? AND is_stale = 0
      GROUP BY CAST(published_at / 3600000 AS INTEGER)
    `).all(now - 7 * 24 * 60 * 60_000, now - 60 * 60_000) as Array<{ cnt: number }>;

    const baseline = hourlyRows.map((r) => r.cnt);
    const { mean, stdDev } = rollingStats(baseline);
    const z = zScore(current.cnt, mean, stdDev || 1);

    // Normalize z-score to 0-100 (z >= 3 = max)
    const value = clamp(Math.round(50 + (z / 3) * 50), 0, 100);

    db.prepare(`
      INSERT INTO indices (name, value, components, computed_at)
      VALUES ('info_velocity', @value, @components, @computedAt)
    `).run({
      value,
      components: JSON.stringify({ currentHourCount: current.cnt, baselineMean: mean, zScore: z }),
      computedAt: Date.now(),
    });

    return value;
  }
}
