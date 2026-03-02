import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class C2IntelConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'c2intel_feeds',
    name: 'C2IntelFeeds',
    category: 'cyber',
    subcategory: 'c2_infrastructure',
    intervalMs: 6 * 60 * 60_000, // every 6h
    rateLimitMs: 3000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://raw.githubusercontent.com/drb-ra/C2IntelFeeds/master',
    attribution: 'C2IntelFeeds (drb-ra)',
    termsUrl: 'https://github.com/drb-ra/C2IntelFeeds',
  };

  protected async doFetch(): Promise<Signal[]> {
    // Fetch the Cobalt Strike C2 feed (CSV: ip,port,host,...)
    const text = await got(`${this.config.baseUrl}/feeds/IPC2-noDomains.csv`).text();
    const lines = text.trim().split('\n').slice(1, 101); // skip header, limit 100

    return lines
      .map((line, idx) => {
        const [ip, port, host] = line.split(',');
        if (!ip?.trim()) return null;
        return {
          id: `c2intel_${ip.trim()}_${port?.trim() ?? '0'}`,
          sourceId: this.config.id,
          category: this.config.category,
          subcategory: 'c2_infrastructure',
          title: `C2 Infrastructure Detected (Cobalt Strike)`,
          summary: `${ip.trim()}:${port?.trim() ?? '?'}${host ? ` — ${host.trim()}` : ''}`,
          severity: 72,
          confidence: 0.75,
          publishedAt: new Date(),
        } as import('@armsrace/shared').Signal;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }
}
