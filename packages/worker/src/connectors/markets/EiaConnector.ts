import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class EiaConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'eia',
    name: 'EIA Energy Data',
    category: 'market',
    subcategory: 'energy',
    intervalMs: 6 * 60 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: true,
    apiKeyEnvVar: 'EIA_API_KEY',
    enabled: true,
    baseUrl: 'https://api.eia.gov/v2/petroleum/pri/spt/data/',
    attribution: 'U.S. Energy Information Administration (EIA)',
    termsUrl: 'https://www.eia.gov/about/information_quality.php',
  };

  protected async doFetch(): Promise<Signal[]> {
    const key = process.env.EIA_API_KEY!;
    const data = await got(this.config.baseUrl, {
      searchParams: {
        api_key: key,
        frequency: 'daily',
        data: 'value',
        facets: { 'product': ['EPCWTI', 'EPCBRENT'] },
        sort: [{ column: 'period', direction: 'desc' }],
        offset: 0,
        length: 10,
      },
    }).json<{ response?: { data: Array<{ period: string; product: string; 'product-name': string; value: number }> } }>();

    const obs = data.response?.data ?? [];
    if (!obs.length) return [];

    const signals: Signal[] = [];
    const latest = obs[0];

    // Only emit signal if oil above $100 (stress indicator)
    if (latest.value > 100) {
      signals.push({
        id: `eia_oil_${latest.period}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'energy_price',
        title: `${latest['product-name']}: $${latest.value.toFixed(2)}/barrel (Elevated)`,
        summary: `Oil price above $100 — potential inflationary and geopolitical stress indicator`,
        severity: Math.min(100, Math.round((latest.value / 150) * 80)),
        confidence: 0.92,
        publishedAt: new Date(latest.period),
      });
    }

    return signals;
  }
}
