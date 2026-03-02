import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class FinnhubConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'finnhub',
    name: 'Finnhub Market News',
    category: 'market',
    subcategory: 'market_news',
    intervalMs: 15 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: true,
    apiKeyEnvVar: 'FINNHUB_API_KEY',
    enabled: true,
    baseUrl: 'https://finnhub.io/api/v1',
    attribution: 'Finnhub Stock API',
    termsUrl: 'https://finnhub.io/terms-of-service',
  };

  protected async doFetch(): Promise<Signal[]> {
    const key = process.env.FINNHUB_API_KEY!;
    const data = await got(`${this.config.baseUrl}/news`, {
      searchParams: { category: 'general', token: key },
    }).json<Array<{
      id: number;
      headline: string;
      summary: string;
      url: string;
      datetime: number;
      related?: string;
    }>>();

    return (data ?? []).slice(0, 50).map((item) => ({
      id: `finnhub_${item.id}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'market_news',
      title: item.headline,
      summary: item.summary?.slice(0, 200),
      severity: 30,
      confidence: 0.75,
      url: item.url,
      publishedAt: new Date(item.datetime * 1000),
    }));
  }
}
