import { GlobalInstabilityIndex } from './GlobalInstabilityIndex.js';
import { EscalationScoreComputer } from './EscalationScore.js';
import { InfraStressIndex } from './InfraStressIndex.js';
import { MarketStressComposite } from './MarketStressComposite.js';
import { InfoVelocityScore } from './InfoVelocityScore.js';
import { ConvergenceDetector } from './ConvergenceDetector.js';
import { AlertDetector } from './AlertDetector.js';
import { AnomalyScorer } from './AnomalyScorer.js';
import { ForecastEngine } from './ForecastEngine.js';
import { Writer } from '../pipeline/Writer.js';
import { logger } from '../logger.js';

const gii = new GlobalInstabilityIndex();
const escalation = new EscalationScoreComputer();
const infra = new InfraStressIndex();
const market = new MarketStressComposite();
const infoVel = new InfoVelocityScore();
const anomaly = new AnomalyScorer();
const forecast = new ForecastEngine();
const writer = new Writer();

export async function runAnalytics(): Promise<void> {
  try {
    const start = Date.now();

    // Compute all indices
    const giiValue = gii.compute();
    const infraValue = infra.compute();
    const marketValue = market.compute();
    const velocityValue = infoVel.compute();

    // Escalation scores
    escalation.compute();

    // Anomaly detection
    const anomalies = anomaly.compute();
    const anomalousCount = anomalies.filter((a) => a.isAnomalous).length;

    // Convergence detection (may fire alerts)
    const convergence = new ConvergenceDetector(writer);
    convergence.detect();

    // Additional alert detectors (geopolitical, military, market, cyber, infra)
    const alertDetector = new AlertDetector(writer);
    alertDetector.detect();

    // Forecasts (less frequently - every 30 min)
    const lastForecast = (await import('../db/client.js')).getDb()
      .prepare(`SELECT MAX(generated_at) as last FROM forecasts`)
      .get() as { last: number | null };

    if (!lastForecast.last || Date.now() - lastForecast.last > 30 * 60_000) {
      forecast.generate();
    }

    // Broadcast index updates via SSE queue
    writer.queueSseEvent('index_update', {
      global_instability: giiValue,
      infra_stress: infraValue,
      market_stress: marketValue,
      info_velocity: velocityValue,
    });

    logger.debug(
      { gii: giiValue, infra: infraValue, market: marketValue, anomalies: anomalousCount, ms: Date.now() - start },
      'Analytics run complete',
    );
  } catch (err) {
    logger.error({ err }, 'Analytics run error');
  }
}
