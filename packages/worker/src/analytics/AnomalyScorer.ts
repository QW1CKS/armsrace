import { getDb } from '../db/client.js';
import { rollingStats, zScore } from '@armsrace/shared';

export interface AnomalyResult {
  sourceId: string;
  category: string;
  zScore: number;
  isAnomalous: boolean;
  currentRate: number;
  baselineMean: number;
}

export class AnomalyScorer {
  compute(): AnomalyResult[] {
    const db = getDb();
    const now = Date.now();
    const results: AnomalyResult[] = [];

    // Get distinct source/category pairs active in last 30d
    const sources = db.prepare(`
      SELECT DISTINCT source_id, category FROM signals
      WHERE published_at > ?
    `).all(now - 30 * 24 * 60 * 60_000) as Array<{ source_id: string; category: string }>;

    for (const { source_id, category } of sources) {
      // Current hour signal count
      const current = db.prepare(`
        SELECT COUNT(*) as cnt FROM signals
        WHERE source_id = ? AND published_at > ? AND is_stale = 0
      `).get(source_id, now - 60 * 60_000) as { cnt: number };

      // Hourly counts for baseline (7d, excluding last hour)
      const hourly = db.prepare(`
        SELECT COUNT(*) as cnt FROM signals
        WHERE source_id = ? AND published_at BETWEEN ? AND ?
        GROUP BY CAST(published_at / 3600000 AS INTEGER)
      `).all(source_id, now - 7 * 24 * 60 * 60_000, now - 60 * 60_000) as Array<{ cnt: number }>;

      if (hourly.length < 12) continue; // Need at least 12 data points

      const { mean, stdDev } = rollingStats(hourly.map((r) => r.cnt));
      const z = zScore(current.cnt, mean, stdDev || 0.1);

      results.push({
        sourceId: source_id,
        category,
        zScore: z,
        isAnomalous: Math.abs(z) > 2.0,
        currentRate: current.cnt,
        baselineMean: mean,
      });
    }

    return results.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
  }
}
