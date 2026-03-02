import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface UrlhausEntry {
  id: string;
  dateadded: string;
  url: string;
  url_status: string;
  threat: string;
  tags?: string[];
  urlhaus_link: string;
  reporter: string;
}

export class UrlhausConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'urlhaus',
    name: 'abuse.ch URLhaus',
    category: 'cyber',
    subcategory: 'malware_url',
    intervalMs: 30 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://urlhaus-api.abuse.ch/v1/urls/recent/',
    attribution: 'abuse.ch URLhaus',
    termsUrl: 'https://urlhaus.abuse.ch/faq/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(this.config.baseUrl, {
      method: 'POST',
      form: { limit: '100' },
    }).json<{ urls?: UrlhausEntry[] }>();

    return (data.urls ?? []).map((entry) => ({
      id: `urlhaus_${entry.id}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'malware_url',
      title: `Malware URL: ${entry.threat}`,
      summary: `${entry.url_status.toUpperCase()} — ${entry.url.slice(0, 100)}`,
      severity: entry.url_status === 'online' ? 65 : 40,
      confidence: 0.8,
      url: entry.urlhaus_link,
      publishedAt: new Date(entry.dateadded),
    }));
  }
}
