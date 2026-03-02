import { getDb } from '../db/client.js';
import { nanoid } from 'nanoid';
import type { Writer } from '../pipeline/Writer.js';

/**
 * AlertDetector — fires the 5 remaining alert types:
 *   geopolitical_escalation, military_posture, market_shock,
 *   cyber_spike, infra_disruption
 *
 * Pattern mirrors ConvergenceDetector: INSERT into alerts table +
 * queueSseEvent so clients receive live toast notifications.
 *
 * Dedup guard: each type has a per-key cooldown window to prevent
 * alert storms from repeated analytics runs.
 */
export class AlertDetector {
  constructor(private writer: Writer) {}

  detect(): void {
    this.detectGeopoliticalEscalation();
    this.detectMilitaryPosture();
    this.detectMarketShock();
    this.detectCyberSpike();
    this.detectInfraDisruption();
  }

  // ─── Geopolitical Escalation ───────────────────────────────────────────────
  // Fire when a country's average conflict severity rises ≥20 points comparing
  // the last 24h window vs the prior 24h window.

  private detectGeopoliticalEscalation(): void {
    const db = getDb();
    const now = Date.now();
    const w24 = now - 24 * 60 * 60_000;
    const w48 = now - 48 * 60 * 60_000;
    const COOLDOWN_MS = 4 * 60 * 60_000; // max 1 alert per country per 4h
    const MIN_SIGNALS = 3;
    const MIN_DELTA = 20;

    const recent = db.prepare(`
      SELECT country_code, AVG(severity) as avg_sev, COUNT(*) as cnt,
             GROUP_CONCAT(id) as ids
      FROM signals
      WHERE category IN ('conflict','advisory','geopolitical')
        AND published_at > ?
        AND is_stale = 0
        AND country_code IS NOT NULL AND country_code != ''
      GROUP BY country_code
      HAVING cnt >= ?
    `).all(w24, MIN_SIGNALS) as Array<{
      country_code: string; avg_sev: number; cnt: number; ids: string;
    }>;

    const prior = db.prepare(`
      SELECT country_code, AVG(severity) as avg_sev
      FROM signals
      WHERE category IN ('conflict','advisory','geopolitical')
        AND published_at BETWEEN ? AND ?
        AND is_stale = 0
        AND country_code IS NOT NULL AND country_code != ''
      GROUP BY country_code
    `).all(w48, w24) as Array<{ country_code: string; avg_sev: number }>;

    const priorMap = new Map(prior.map((r) => [r.country_code, r.avg_sev]));

    for (const row of recent) {
      const prev = priorMap.get(row.country_code) ?? null;
      if (prev === null) continue;
      const delta = row.avg_sev - prev;
      if (delta < MIN_DELTA) continue;

      const existing = db.prepare(`
        SELECT 1 FROM alerts
        WHERE type = 'geopolitical_escalation'
          AND json_extract(entities_json, '$[0].name') = ?
          AND triggered_at > ?
      `).get(row.country_code, now - COOLDOWN_MS);
      if (existing) continue;

      const alertId = nanoid();
      const severity = Math.min(100, Math.round(row.avg_sev));
      const title = `Geopolitical Escalation: ${row.country_code}`;
      const body = `Conflict signal severity in ${row.country_code} rose +${Math.round(delta)} points over the last 24h (from ${Math.round(prev)} → ${Math.round(row.avg_sev)}/100) based on ${row.cnt} new signals.`;

      db.prepare(`
        INSERT INTO alerts (id, type, severity, confidence, title, body, sources_json, entities_json, signal_ids)
        VALUES (@id, 'geopolitical_escalation', @severity, @confidence, @title, @body, '[]', @entities, @signalIds)
      `).run({
        id: alertId,
        severity,
        confidence: Math.min(0.90, 0.55 + delta / 100),
        title,
        body,
        entities: JSON.stringify([{ name: row.country_code, type: 'country' }]),
        signalIds: JSON.stringify(row.ids.split(',').slice(0, 20)),
      });

      this.writer.queueSseEvent('alert', { id: alertId, type: 'geopolitical_escalation', severity, title });
    }
  }

  // ─── Military Posture ──────────────────────────────────────────────────────
  // Fire when ≥5 military/aviation/maritime signals with severity ≥50 appear
  // within a 2h window, suggesting unusual posture activity.

  private detectMilitaryPosture(): void {
    const db = getDb();
    const now = Date.now();
    const WINDOW_MS = 2 * 60 * 60_000;
    const COOLDOWN_MS = 3 * 60 * 60_000;
    const MIN_SIGNALS = 5;
    const MIN_SEVERITY = 50;

    const rows = db.prepare(`
      SELECT country_code,
             COUNT(*) as cnt,
             AVG(severity) as avg_sev,
             GROUP_CONCAT(id) as ids
      FROM signals
      WHERE category IN ('military','aviation','maritime')
        AND published_at > ?
        AND severity >= ?
        AND is_stale = 0
      GROUP BY country_code
      HAVING cnt >= ?
      ORDER BY avg_sev DESC
      LIMIT 10
    `).all(now - WINDOW_MS, MIN_SEVERITY, MIN_SIGNALS) as Array<{
      country_code: string | null; cnt: number; avg_sev: number; ids: string;
    }>;

    for (const row of rows) {
      const key = row.country_code ?? 'GLOBAL';
      const existing = db.prepare(`
        SELECT 1 FROM alerts
        WHERE type = 'military_posture'
          AND json_extract(entities_json, '$[0].name') = ?
          AND triggered_at > ?
      `).get(key, now - COOLDOWN_MS);
      if (existing) continue;

      const alertId = nanoid();
      const severity = Math.min(100, Math.round(row.avg_sev));
      const regionLabel = row.country_code ? `in ${row.country_code}` : 'globally';
      const title = `Military Posture Alert${row.country_code ? `: ${row.country_code}` : ''}`;
      const body = `${row.cnt} military/aviation/maritime signals (avg severity ${Math.round(row.avg_sev)}/100) detected ${regionLabel} within the last 2 hours, indicating unusual operational activity.`;

      db.prepare(`
        INSERT INTO alerts (id, type, severity, confidence, title, body, sources_json, entities_json, signal_ids)
        VALUES (@id, 'military_posture', @severity, @confidence, @title, @body, '[]', @entities, @signalIds)
      `).run({
        id: alertId,
        severity,
        confidence: Math.min(0.88, 0.50 + (row.cnt - MIN_SIGNALS) * 0.05),
        title,
        body,
        entities: JSON.stringify([{ name: key, type: 'country' }]),
        signalIds: JSON.stringify(row.ids.split(',').slice(0, 20)),
      });

      this.writer.queueSseEvent('alert', { id: alertId, type: 'military_posture', severity, title });
    }
  }

  // ─── Market Shock ──────────────────────────────────────────────────────────
  // Fire when a market asset has an absolute change ≥5% in a single snapshot
  // OR when the market stress index exceeds 75.

  private detectMarketShock(): void {
    const db = getDb();
    const now = Date.now();
    const COOLDOWN_MS = 2 * 60 * 60_000;
    const SHOCK_THRESHOLD = 5; // ≥5% move
    const STRESS_THRESHOLD = 75;

    // Shock from large price moves
    const movers = db.prepare(`
      SELECT symbol, asset_class, price, change_pct
      FROM market_snapshots
      WHERE ABS(CAST(change_pct AS REAL)) >= ?
      ORDER BY ABS(CAST(change_pct AS REAL)) DESC
      LIMIT 5
    `).all(SHOCK_THRESHOLD) as Array<{
      symbol: string; asset_class: string; price: number; change_pct: number;
    }>;

    for (const m of movers) {
      const key = `market_shock:${m.symbol}`;
      const existing = db.prepare(`
        SELECT 1 FROM alerts
        WHERE type = 'market_shock'
          AND json_extract(entities_json, '$[0].name') = ?
          AND triggered_at > ?
      `).get(m.symbol, now - COOLDOWN_MS);
      if (existing) continue;

      const changePct = Number(m.change_pct ?? 0);
      const alertId = nanoid();
      const severity = Math.min(100, Math.round(50 + Math.abs(changePct) * 2));
      const direction = changePct >= 0 ? '▲' : '▼';
      const title = `Market Shock: ${m.symbol} ${direction}${Math.abs(changePct).toFixed(1)}%`;
      const body = `${m.symbol} (${m.asset_class}) moved ${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}% to ${Number(m.price).toLocaleString(undefined, { maximumFractionDigits: 4 })}, triggering a market shock alert.`;

      db.prepare(`
        INSERT INTO alerts (id, type, severity, confidence, title, body, sources_json, entities_json, signal_ids)
        VALUES (@id, 'market_shock', @severity, @confidence, @title, @body, '[]', @entities, '[]')
      `).run({
        id: alertId,
        severity,
        confidence: 0.80,
        title,
        body,
        entities: JSON.stringify([{ name: m.symbol, type: 'asset' }]),
      });

      this.writer.queueSseEvent('alert', { id: alertId, type: 'market_shock', severity, title });
    }

    // High market stress index
    const stressRow = db.prepare(`
      SELECT value FROM indices WHERE name = 'market_stress' ORDER BY computed_at DESC LIMIT 1
    `).get() as { value: number } | undefined;

    if (stressRow && stressRow.value >= STRESS_THRESHOLD) {
      const existing = db.prepare(`
        SELECT 1 FROM alerts
        WHERE type = 'market_shock'
          AND json_extract(entities_json, '$[0].name') = 'MARKET_STRESS_INDEX'
          AND triggered_at > ?
      `).get(now - COOLDOWN_MS);

      if (!existing) {
        const alertId = nanoid();
        const severity = Math.min(100, Math.round(stressRow.value));
        const title = `Market Stress Index: ${Math.round(stressRow.value)}/100`;
        const body = `The composite Market Stress Index has reached ${Math.round(stressRow.value)}/100, indicating elevated systemic financial risk across tracked asset classes.`;

        db.prepare(`
          INSERT INTO alerts (id, type, severity, confidence, title, body, sources_json, entities_json, signal_ids)
          VALUES (@id, 'market_shock', @severity, @confidence, @title, @body, '[]', @entities, '[]')
        `).run({
          id: alertId,
          severity,
          confidence: 0.85,
          title,
          body,
          entities: JSON.stringify([{ name: 'MARKET_STRESS_INDEX', type: 'index' }]),
        });

        this.writer.queueSseEvent('alert', { id: alertId, type: 'market_shock', severity, title });
      }
    }
  }

  // ─── Cyber Spike ───────────────────────────────────────────────────────────
  // Fire when cyber signal count in the last hour is >2× the 7-day hourly
  // baseline (min 10 signals in current window to avoid noise).

  private detectCyberSpike(): void {
    const db = getDb();
    const now = Date.now();
    const COOLDOWN_MS = 60 * 60_000; // 1h cooldown
    const MULTIPLIER = 2.0;
    const MIN_WINDOW_COUNT = 10;

    const currentHour = db.prepare(`
      SELECT COUNT(*) as cnt, GROUP_CONCAT(id) as ids
      FROM signals
      WHERE category = 'cyber'
        AND published_at > ?
        AND is_stale = 0
    `).get(now - 60 * 60_000) as { cnt: number; ids: string };

    if (currentHour.cnt < MIN_WINDOW_COUNT) return;

    const sevenDayAvg = db.prepare(`
      SELECT COUNT(*) * 1.0 / (7 * 24) as hourly_avg
      FROM signals
      WHERE category = 'cyber'
        AND published_at BETWEEN ? AND ?
        AND is_stale = 0
    `).get(now - 7 * 24 * 60 * 60_000, now - 60 * 60_000) as { hourly_avg: number };

    const baseline = sevenDayAvg.hourly_avg;
    if (!baseline || baseline < 1) return;
    if (currentHour.cnt < baseline * MULTIPLIER) return;

    const existing = db.prepare(`
      SELECT 1 FROM alerts WHERE type = 'cyber_spike' AND triggered_at > ?
    `).get(now - COOLDOWN_MS);
    if (existing) return;

    const alertId = nanoid();
    const ratio = (currentHour.cnt / baseline).toFixed(1);
    const severity = Math.min(100, Math.round(40 + (currentHour.cnt / baseline) * 15));
    const title = `Cyber Spike: ${currentHour.cnt}× signals (${ratio}× baseline)`;
    const body = `${currentHour.cnt} cyber threat signals detected in the last hour — ${ratio}× the 7-day hourly average of ${Math.round(baseline)}. Possible coordinated campaign or major vulnerability disclosure.`;

    db.prepare(`
      INSERT INTO alerts (id, type, severity, confidence, title, body, sources_json, entities_json, signal_ids)
      VALUES (@id, 'cyber_spike', @severity, @confidence, @title, @body, '[]', '[]', @signalIds)
    `).run({
      id: alertId,
      severity,
      confidence: Math.min(0.92, 0.65 + (currentHour.cnt / baseline - MULTIPLIER) * 0.1),
      title,
      body,
      signalIds: JSON.stringify((currentHour.ids ?? '').split(',').slice(0, 20)),
    });

    this.writer.queueSseEvent('alert', { id: alertId, type: 'cyber_spike', severity, title });
  }

  // ─── Infrastructure Disruption ─────────────────────────────────────────────
  // Fire when ≥3 infrastructure/maritime/aviation signals with severity ≥60
  // appear in the last 1h, possibly indicating significant outage/blockage.

  private detectInfraDisruption(): void {
    const db = getDb();
    const now = Date.now();
    const WINDOW_MS = 60 * 60_000;
    const COOLDOWN_MS = 2 * 60 * 60_000;
    const MIN_SIGNALS = 3;
    const MIN_SEVERITY = 60;

    const rows = db.prepare(`
      SELECT country_code,
             COUNT(*) as cnt,
             AVG(severity) as avg_sev,
             MAX(severity) as max_sev,
             GROUP_CONCAT(id) as ids,
             GROUP_CONCAT(title, ' | ') as titles
      FROM signals
      WHERE category IN ('infrastructure','maritime','aviation')
        AND published_at > ?
        AND severity >= ?
        AND is_stale = 0
      GROUP BY country_code
      HAVING cnt >= ?
      ORDER BY max_sev DESC
      LIMIT 10
    `).all(now - WINDOW_MS, MIN_SEVERITY, MIN_SIGNALS) as Array<{
      country_code: string | null;
      cnt: number;
      avg_sev: number;
      max_sev: number;
      ids: string;
      titles: string;
    }>;

    for (const row of rows) {
      const key = row.country_code ?? 'GLOBAL';
      const existing = db.prepare(`
        SELECT 1 FROM alerts
        WHERE type = 'infra_disruption'
          AND json_extract(entities_json, '$[0].name') = ?
          AND triggered_at > ?
      `).get(key, now - COOLDOWN_MS);
      if (existing) continue;

      const alertId = nanoid();
      const severity = Math.min(100, Math.round(row.max_sev));
      const regionLabel = row.country_code ? ` in ${row.country_code}` : '';
      const title = `Infrastructure Disruption${row.country_code ? `: ${row.country_code}` : ''}`;
      const body = `${row.cnt} critical infrastructure signals (severity ≥${MIN_SEVERITY}) detected${regionLabel} in the last hour. Peak severity: ${Math.round(row.max_sev)}/100.`;

      db.prepare(`
        INSERT INTO alerts (id, type, severity, confidence, title, body, sources_json, entities_json, signal_ids)
        VALUES (@id, 'infra_disruption', @severity, @confidence, @title, @body, '[]', @entities, @signalIds)
      `).run({
        id: alertId,
        severity,
        confidence: Math.min(0.88, 0.55 + (row.cnt - MIN_SIGNALS) * 0.08),
        title,
        body,
        entities: JSON.stringify([{ name: key, type: 'country' }]),
        signalIds: JSON.stringify(row.ids.split(',').slice(0, 20)),
      });

      this.writer.queueSseEvent('alert', { id: alertId, type: 'infra_disruption', severity, title });
    }
  }
}
