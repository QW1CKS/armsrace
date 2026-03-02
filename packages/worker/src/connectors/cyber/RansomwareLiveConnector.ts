import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface RansomwareGroup {
  name: string;
  attacks: number;
}

interface RansomwareVictim {
  post_title: string;
  group_name: string;
  published: string;
  website?: string;
  country?: string;
}

export class RansomwareLiveConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'ransomware_live',
    name: 'ransomware.live',
    category: 'cyber',
    subcategory: 'ransomware',
    intervalMs: 60 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://api.ransomware.live/v2',
    attribution: 'ransomware.live',
    termsUrl: 'https://ransomware.live/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(`${this.config.baseUrl}/recentvictims`, {
      headers: { Accept: 'application/json' },
    }).json<RansomwareVictim[]>();

    const victims = Array.isArray(data) ? data.slice(0, 50) : [];

    return victims
      .filter((v) => v.post_title)
      .map((v) => ({
        id: `ransom_${v.group_name ?? 'unknown'}_${v.published ?? 'unknown'}_${(v.post_title ?? '').slice(0, 20)}`.replace(/\s+/g, '_'),
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'ransomware',
        title: `Ransomware Attack: ${v.post_title}`,
        summary: `Group: ${v.group_name ?? 'Unknown'}${v.country ? ` | Country: ${v.country}` : ''}`,
        severity: 75,
        confidence: 0.8,
        countryCode: v.country?.slice(0, 2).toUpperCase(),
        url: v.website,
        publishedAt: new Date(v.published ?? Date.now()),
      }));
  }
}
