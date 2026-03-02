import { getDb } from '../db/client.js';
import { clamp, weightedAverage } from '@armsrace/shared';

export class InfraStressIndex {
  compute(): number {
    const db = getDb();
    const since = Date.now() - 24 * 60 * 60_000;

    const getScore = (subcategory: string): number => {
      const row = db.prepare(`
        SELECT AVG(severity) as avg, COUNT(*) as cnt
        FROM signals
        WHERE (category = 'infrastructure' OR subcategory = ?)
          AND published_at > ? AND is_stale = 0
      `).get(subcategory, since) as { avg: number | null; cnt: number };

      if (!row.avg) return 0;
      return clamp(Math.round(row.avg), 0, 100);
    };

    const components = {
      internet_outage: getScore('internet_outage'),
      aviation: getScore('aviation'),
      maritime: getScore('maritime'),
      airport_delay: getScore('airport_delay'),
      power: getScore('power'),
    };

    const value = clamp(
      Math.round(
        weightedAverage([
          { value: components.internet_outage, weight: 0.35 },
          { value: components.aviation, weight: 0.25 },
          { value: components.maritime, weight: 0.20 },
          { value: components.airport_delay, weight: 0.10 },
          { value: components.power, weight: 0.10 },
        ]),
      ),
      0,
      100,
    );

    db.prepare(`
      INSERT INTO indices (name, value, components, computed_at)
      VALUES ('infra_stress', @value, @components, @computedAt)
    `).run({ value, components: JSON.stringify(components), computedAt: Date.now() });

    return value;
  }
}
