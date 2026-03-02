import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface TravelAdvisoryEntry {
  country_code: string;
  name: string;
  advisory: {
    score: number;
    sources_active: number;
    message: string;
    updated: string;
    source: string;
    source_link: string;
  };
}

/** Travel Safety Index — aggregates US/UK/AU/CA/NL advisories */
export class TravelAdvisoryConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'travel_safety_index',
    name: 'Travel Safety Index (Multi-Source)',
    category: 'geo',
    subcategory: 'travel_advisory',
    intervalMs: 4 * 60 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://www.travel-advisory.info/api',
    attribution: 'Travel Advisory (travel-advisory.info)',
    termsUrl: 'https://www.travel-advisory.info/info',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(`${this.config.baseUrl}?lang=en`).json<{
      data: Record<string, TravelAdvisoryEntry>;
    }>();

    const signals: Signal[] = [];

    for (const [code, entry] of Object.entries(data.data ?? {})) {
      const score = entry.advisory?.score ?? 0;
      if (score < 3.5) continue; // Only show elevated risk (>3.5/5)

      const severity = Math.round(((score - 1) / 4) * 100);

      signals.push({
        id: `travel_${code}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'travel_advisory',
        title: `Travel Advisory: ${entry.name} (Risk ${score.toFixed(1)}/5)`,
        summary: entry.advisory?.message?.slice(0, 300) ?? `Risk score: ${score}`,
        severity,
        confidence: 0.8,
        countryCode: code,
        url: entry.advisory?.source_link,
        publishedAt: entry.advisory?.updated ? new Date(entry.advisory.updated) : new Date(),
      });
    }

    return signals;
  }
}
