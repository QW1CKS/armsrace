import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface OtxPulse {
  id: string;
  name: string;
  description?: string;
  created: string;
  adversary?: string;
  targeted_countries?: string[];
  tags?: string[];
  references?: string[];
  TLP?: string;
}

export class AlienVaultOtxConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'alienvault_otx',
    name: 'AlienVault OTX',
    category: 'cyber',
    subcategory: 'threat_intel',
    intervalMs: 60 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: true,
    apiKeyEnvVar: 'OTX_API_KEY',
    enabled: true,
    baseUrl: 'https://otx.alienvault.com/api/v1',
    attribution: 'AlienVault OTX',
    termsUrl: 'https://otx.alienvault.com/about/legal',
  };

  protected async doFetch(): Promise<Signal[]> {
    const key = process.env.OTX_API_KEY!;
    const data = await got(`${this.config.baseUrl}/pulses/subscribed?limit=50&modified_since=${this.since()}`, {
      headers: { 'X-OTX-API-KEY': key },
    }).json<{ results: OtxPulse[] }>();

    return (data.results ?? []).map((pulse) => ({
      id: `otx_${pulse.id}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'threat_intel',
      title: pulse.name,
      summary: [
        pulse.description?.slice(0, 200),
        pulse.adversary ? `Adversary: ${pulse.adversary}` : null,
        pulse.targeted_countries?.length ? `Targets: ${pulse.targeted_countries.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
      severity: 60,
      confidence: 0.75,
      url: `https://otx.alienvault.com/pulse/${pulse.id}`,
      publishedAt: new Date(pulse.created),
    }));
  }

  private since(): string {
    const d = new Date(Date.now() - 24 * 60 * 60_000);
    return d.toISOString();
  }
}
