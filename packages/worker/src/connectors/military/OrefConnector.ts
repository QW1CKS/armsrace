import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

// OREF - Israeli Home Front Command rocket/siren alerts
export class OrefConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'oref_alerts',
    name: 'OREF Rocket/Siren Alerts',
    category: 'military',
    subcategory: 'rocket_alert',
    intervalMs: 2 * 60_000, // every 2 minutes
    rateLimitMs: 1000,
    requiresApiKey: false,
    enabled: false, // OREF API is geo-restricted to Israel
    baseUrl: 'https://www.oref.org.il/WarningMessages/alert/alerts.json',
    attribution: 'OREF (Israel Home Front Command)',
    termsUrl: 'https://www.oref.org.il/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(this.config.baseUrl, {
      headers: {
        Referer: 'https://www.oref.org.il/',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
      timeout: { request: 8000 },
    }).json<{ id?: string; title?: string; data?: string[] } | null>();

    if (!data?.data?.length) return [];

    return [{
      id: `oref_${data.id ?? Date.now()}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'rocket_alert',
      title: `OREF Alert: ${data.title ?? 'Rocket/Missile Warning'}`,
      summary: `Locations: ${data.data.slice(0, 10).join(', ')}${data.data.length > 10 ? ` +${data.data.length - 10} more` : ''}`,
      severity: 90,
      confidence: 0.95,
      countryCode: 'IL',
      lat: 31.5,
      lon: 34.75,
      publishedAt: new Date(),
    }];
  }
}
