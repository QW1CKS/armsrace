import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class GdeltConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'gdelt',
    name: 'GDELT Event Database',
    category: 'geo',
    subcategory: 'conflict_event',
    intervalMs: 15 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://api.gdeltproject.org/api/v2',
    attribution: 'The GDELT Project',
    termsUrl: 'https://www.gdeltproject.org/about.html#termsofuse',
  };

  protected async doFetch(): Promise<Signal[]> {
    // GDELT GKG: top themes related to conflict/unrest in last 15 minutes
    const response = await got(
      `${this.config.baseUrl}/doc/doc?query=conflict+OR+military+OR+protest+OR+attack&mode=artlist&maxrecords=50&format=json`,
    ).json<{ articles?: Array<{ url: string; title: string; seendate: string; sourcecountry?: string; language?: string }> }>();

    return (response.articles ?? []).map((article) => ({
      id: `gdelt_${Buffer.from(article.url).toString('base64').slice(0, 32)}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'conflict_event',
      title: article.title,
      summary: `Source: ${article.sourcecountry ?? 'Unknown'} | Language: ${article.language ?? 'unknown'}`,
      severity: 45,
      confidence: 0.6,
      countryCode: article.sourcecountry?.slice(0, 2).toUpperCase(),
      url: article.url,
      publishedAt: this.parseGdeltDate(article.seendate),
    }));
  }

  private parseGdeltDate(s: string): Date {
    // GDELT date format: YYYYMMDDHHMMSS
    if (!s || s.length < 14) return new Date();
    return new Date(
      `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}Z`,
    );
  }
}
