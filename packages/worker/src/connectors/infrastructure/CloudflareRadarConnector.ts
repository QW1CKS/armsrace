import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class CloudflareRadarConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'cloudflare_radar',
    name: 'Cloudflare Radar',
    category: 'infrastructure',
    subcategory: 'internet_outage',
    intervalMs: 30 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: true,
    apiKeyEnvVar: 'CLOUDFLARE_API_TOKEN',
    enabled: true,
    baseUrl: 'https://api.cloudflare.com/client/v4/radar',
    attribution: 'Cloudflare Radar',
    termsUrl: 'https://www.cloudflare.com/supplemental-terms/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const token = process.env.CLOUDFLARE_API_TOKEN!;

    // Fetch recent internet outage events
    const data = await got(`${this.config.baseUrl}/traffic_anomalies/locations`, {
      headers: { Authorization: `Bearer ${token}` },
      searchParams: {
        dateRange: '24h',
        status: 'VERIFIED',
      },
    }).json<{
      result?: {
        timestamps?: string[];
        confidence?: Array<{ anomalyClass: string; score: number }>;
        locations?: Array<{
          locationName?: string;
          locationCode?: string;
        }>;
      };
    }>();

    const locations = data.result?.locations ?? [];
    if (!locations.length) return [];

    return locations.slice(0, 20).map((loc) => ({
      id: `cfradar_${loc.locationCode ?? 'XX'}_${Date.now()}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'internet_outage',
      title: `Internet Traffic Anomaly: ${loc.locationName ?? loc.locationCode ?? 'Unknown Region'}`,
      summary: `Cloudflare Radar detected internet outage/anomaly in ${loc.locationName ?? 'Unknown'}`,
      severity: 60,
      confidence: 0.75,
      countryCode: loc.locationCode,
      publishedAt: new Date(),
    }));
  }
}
