import { getDb } from '../db/client.js';
import { clamp } from '@armsrace/shared';

export class MarketStressComposite {
  compute(): number {
    const db = getDb();

    // Get latest fear/greed index
    const fearGreed = db.prepare(`
      SELECT value FROM indices WHERE name = 'fear_greed'
      ORDER BY computed_at DESC LIMIT 1
    `).get() as { value: number } | undefined;

    const since = Date.now() - 24 * 60 * 60_000;
    const marketShocks = db.prepare(`
      SELECT COUNT(*) as cnt, AVG(severity) as avg_sev
      FROM signals
      WHERE category = 'market' AND subcategory IN ('market_shock', 'crypto_shock')
        AND published_at > ? AND is_stale = 0
    `).get(since) as { cnt: number; avg_sev: number | null };

    // VIX proxy from market signals
    const volatilityProxy = db.prepare(`
      SELECT AVG(severity) as avg FROM signals
      WHERE category = 'market' AND subcategory = 'volatility'
      AND published_at > ? AND is_stale = 0
    `).get(since) as { avg: number | null };

    const fg = fearGreed?.value ?? 50;
    // Fear & Greed: 0 = extreme fear = high stress, 100 = extreme greed = moderate stress
    const fgStress = fg <= 25 ? 80 : fg >= 75 ? 45 : 100 - fg;

    const shockScore = Math.min(100,
      (marketShocks.cnt > 0 ? 40 : 0) + (marketShocks.avg_sev ?? 0) * 0.5,
    );

    const volScore = volatilityProxy.avg ?? 0;

    const components = {
      fear_greed_stress: fgStress,
      market_shocks: shockScore,
      volatility: volScore,
    };

    const value = clamp(
      Math.round(fgStress * 0.4 + shockScore * 0.35 + volScore * 0.25),
      0,
      100,
    );

    db.prepare(`
      INSERT INTO indices (name, value, components, computed_at)
      VALUES ('market_stress', @value, @components, @computedAt)
    `).run({ value, components: JSON.stringify(components), computedAt: Date.now() });

    return value;
  }
}
