import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class HapiConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'hapi',
    name: 'HAPI (Humanitarian Data)',
    category: 'geo',
    subcategory: 'humanitarian',
    intervalMs: 12 * 60 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://hapi.humdata.org/api/v1',
    attribution: 'UN OCHA Humanitarian API (HAPI)',
    termsUrl: 'https://hapi.humdata.org/docs#terms',
  };

  protected async doFetch(): Promise<Signal[]> {
    const appId = process.env.HAPI_APP_IDENTIFIER ?? 'armsrace-monitor';
    const data = await got(`${this.config.baseUrl}/affected-people/humanitarian-needs`, {
      searchParams: {
        output_format: 'json',
        app_identifier: appId,
        limit: 50,
        sort: 'reference_period_end',
        direction: 'desc',
      },
    }).json<{ data?: Array<{ location_code: string; location_name: string; population_in_need: number; reference_period_start: string }> }>();

    return (data.data ?? [])
      .filter((d) => d.population_in_need > 100_000)
      .map((d) => ({
        id: `hapi_needs_${d.location_code}_${d.reference_period_start.split('T')[0]}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'humanitarian_needs',
        title: `Humanitarian Crisis: ${d.location_name}`,
        summary: `${(d.population_in_need / 1_000_000).toFixed(1)}M people in need`,
        severity: Math.min(100, Math.round(20 + (d.population_in_need / 5_000_000) * 60)),
        confidence: 0.85,
        countryCode: d.location_code.slice(0, 2),
        publishedAt: new Date(d.reference_period_start),
      }));
  }
}
