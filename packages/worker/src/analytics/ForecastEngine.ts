import { getDb } from '../db/client.js';
import { nanoid } from 'nanoid';
import { FORECAST_DISCLAIMER } from '@armsrace/shared';
import type { ForecastHorizon } from '@armsrace/shared';

const HORIZONS: ForecastHorizon[] = ['24h', '72h', '7d'];
const HORIZON_MS: Record<ForecastHorizon, number> = {
  '24h': 24 * 60 * 60_000,
  '72h': 72 * 60 * 60_000,
  '7d': 7 * 24 * 60 * 60_000,
};

export class ForecastEngine {
  generate(): void {
    const db = getDb();

    // Clean up old forecasts
    db.prepare(`DELETE FROM forecasts WHERE generated_at < ?`).run(Date.now() - 7 * 24 * 60 * 60_000);

    for (const horizon of HORIZONS) {
      this.generateGlobalForecast(horizon);
      this.generateRegionForecasts(horizon);
    }
  }

  private generateGlobalForecast(horizon: ForecastHorizon): void {
    const db = getDb();
    const latestGii = db.prepare(`
      SELECT value FROM indices WHERE name = 'global_instability'
      ORDER BY computed_at DESC LIMIT 1
    `).get() as { value: number } | undefined;

    const gii = latestGii?.value ?? 50;
    const probability = this.giiToProbability(gii, horizon);
    const narrative = this.buildGlobalNarrative(gii, horizon, probability);

    db.prepare(`
      INSERT INTO forecasts (id, horizon, subject, subject_type, probability, narrative, confidence, signal_basis)
      VALUES (@id, @horizon, 'Global', 'global', @probability, @narrative, @confidence, '[]')
    `).run({
      id: nanoid(),
      horizon,
      probability,
      narrative: `${narrative}\n\n${FORECAST_DISCLAIMER}`,
      confidence: 0.55,
    });
  }

  private generateRegionForecasts(horizon: ForecastHorizon): void {
    const db = getDb();
    const topCountries = db.prepare(`
      SELECT country_code, score FROM escalation_scores
      WHERE computed_at > ? AND score > 40
      GROUP BY country_code
      HAVING MAX(computed_at)
      ORDER BY score DESC
      LIMIT 10
    `).all(Date.now() - 24 * 60 * 60_000) as Array<{ country_code: string; score: number }>;

    for (const { country_code, score } of topCountries) {
      const probability = this.scoreToProbability(score, horizon);
      const narrative = this.buildRegionNarrative(country_code, score, horizon, probability);

      db.prepare(`
        INSERT INTO forecasts (id, horizon, subject, subject_type, probability, narrative, confidence, signal_basis)
        VALUES (@id, @horizon, @subject, 'country', @probability, @narrative, @confidence, '[]')
      `).run({
        id: nanoid(),
        horizon,
        subject: country_code,
        probability,
        narrative: `${narrative}\n\n${FORECAST_DISCLAIMER}`,
        confidence: 0.50,
      });
    }
  }

  private giiToProbability(gii: number, horizon: ForecastHorizon): number {
    const base = gii / 100;
    const decay = { '24h': 1.0, '72h': 0.85, '7d': 0.70 }[horizon];
    return Math.round(base * decay * 100) / 100;
  }

  private scoreToProbability(score: number, horizon: ForecastHorizon): number {
    const base = score / 100;
    const decay = { '24h': 1.0, '72h': 0.80, '7d': 0.65 }[horizon];
    return Math.round(base * decay * 100) / 100;
  }

  private buildGlobalNarrative(gii: number, horizon: ForecastHorizon, prob: number): string {
    const level = gii > 70 ? 'high' : gii > 40 ? 'moderate' : 'low';
    const direction = gii > 60 ? 'elevated risk of further escalation' : 'stable-to-improving conditions expected';
    return (
      `Over the next ${horizon}, global instability is at a ${level} level (index: ${gii}/100). ` +
      `Current signal patterns suggest ${direction}. ` +
      `Estimated probability of significant escalation: ${Math.round(prob * 100)}%.`
    );
  }

  private buildRegionNarrative(country: string, score: number, horizon: ForecastHorizon, prob: number): string {
    const level = score > 70 ? 'high' : score > 40 ? 'elevated' : 'moderate';
    return (
      `${country} shows ${level} escalation risk (score: ${score}/100) over the next ${horizon}. ` +
      `Estimated probability of continued deterioration: ${Math.round(prob * 100)}%.`
    );
  }
}
