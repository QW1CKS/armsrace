import { getDb } from '../db/client.js';
import { weightedAverage, clamp } from '@armsrace/shared';

/**
 * Global Instability Index (0-100)
 * Weighted composite of all signal categories over the last 24h
 */
export class GlobalInstabilityIndex {
  compute(): number {
    const db = getDb();
    const since = Date.now() - 24 * 60 * 60_000;

    const getCategoryScore = (category: string): number => {
      const row = db.prepare(`
        SELECT AVG(severity) as avg, COUNT(*) as cnt
        FROM signals
        WHERE category = ? AND published_at > ? AND is_stale = 0
      `).get(category, since) as { avg: number | null; cnt: number };

      if (!row.avg || !row.cnt) return 0;
      // Blend average severity with volume factor
      const volumeFactor = clamp(Math.log10(row.cnt + 1) / Math.log10(500), 0, 1);
      return clamp((row.avg / 100) * 70 + volumeFactor * 30, 0, 100);
    };

    const components = {
      conflict: getCategoryScore('geo') * 0.5 + getCategoryScore('military') * 0.5,
      cyber: getCategoryScore('cyber'),
      market: getCategoryScore('market'),
      hazard: getCategoryScore('hazard'),
      infra: getCategoryScore('infrastructure'),
      info_velocity: this.getInfoVelocity(),
    };

    const gii = weightedAverage([
      { value: components.conflict, weight: 0.30 },
      { value: components.cyber, weight: 0.20 },
      { value: components.market, weight: 0.15 },
      { value: components.hazard, weight: 0.15 },
      { value: components.infra, weight: 0.10 },
      { value: components.info_velocity, weight: 0.10 },
    ]);

    const value = clamp(Math.round(gii), 0, 100);

    db.prepare(`
      INSERT INTO indices (name, value, components, computed_at)
      VALUES ('global_instability', @value, @components, @computedAt)
    `).run({
      value,
      components: JSON.stringify(components),
      computedAt: Date.now(),
    });

    return value;
  }

  private getInfoVelocity(): number {
    const db = getDb();
    const now = Date.now();
    const currentHour = db.prepare(`
      SELECT COUNT(*) as cnt FROM signals WHERE published_at > ?
    `).get(now - 60 * 60_000) as { cnt: number };

    const baseline = db.prepare(`
      SELECT AVG(hourly_cnt) as avg FROM (
        SELECT COUNT(*) as hourly_cnt
        FROM signals
        WHERE published_at > ? AND published_at < ?
        GROUP BY CAST(published_at / 3600000 AS INTEGER)
      )
    `).get(now - 7 * 24 * 60 * 60_000, now - 24 * 60 * 60_000) as { avg: number | null };

    const baselineRate = baseline.avg ?? 10;
    const currentRate = currentHour.cnt;
    if (baselineRate === 0) return 50;

    const ratio = currentRate / baselineRate;
    return clamp(Math.round((ratio - 0.5) / 2.5 * 100), 0, 100);
  }
}
