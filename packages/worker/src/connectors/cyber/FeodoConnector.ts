import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface FeodoEntry {
  ip_address: string;
  port: number;
  status: string;
  hostname?: string;
  as_number?: number;
  as_name?: string;
  country?: string;
  first_seen: string;
  last_online?: string;
  malware: string;
}

export class FeodoConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'feodo_tracker',
    name: 'abuse.ch Feodo Tracker',
    category: 'cyber',
    subcategory: 'botnet_c2',
    intervalMs: 30 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://feodotracker.abuse.ch/downloads/ipblocklist.json',
    attribution: 'abuse.ch Feodo Tracker',
    termsUrl: 'https://feodotracker.abuse.ch/faq/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(this.config.baseUrl).json<{ results: FeodoEntry[] }>();
    const entries = (data.results ?? []).slice(0, 200);

    return entries.map((entry) => ({
      id: `feodo_${entry.ip_address}_${entry.port}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'botnet_c2',
      title: `${entry.malware} C2 Server Detected`,
      summary: `${entry.ip_address}:${entry.port} — ${entry.as_name ?? 'Unknown AS'} (${entry.country ?? '??'})`,
      severity: entry.status === 'online' ? 70 : 45,
      confidence: 0.85,
      countryCode: entry.country,
      url: `https://feodotracker.abuse.ch/browse/host/${entry.ip_address}/`,
      publishedAt: new Date(entry.first_seen),
    }));
  }
}
