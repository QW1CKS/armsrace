import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class GpsjamConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'gpsjam',
    name: 'GPSJam (GNSS Interference)',
    category: 'military',
    subcategory: 'gps_jamming',
    intervalMs: 60 * 60_000,
    rateLimitMs: 3000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://gpsjam.org',
    attribution: 'gpsjam.org',
    termsUrl: 'https://gpsjam.org/',
  };

  protected async doFetch(): Promise<Signal[]> {
    // GPSJam provides a GeoJSON of interference regions
    const yesterday = new Date(Date.now() - 24 * 60 * 60_000)
      .toISOString()
      .split('T')[0];

    const data = await got(`${this.config.baseUrl}/geo/${yesterday}.geojson`, {
      timeout: { request: 15000 },
    }).json<{
      features?: Array<{
        properties: { level: number };
        geometry: { type: string; coordinates: number[] | number[][] };
      }>;
    }>();

    const signals: Signal[] = [];

    for (const feat of (data.features ?? []).slice(0, 200)) {
      const level = feat.properties.level ?? 0;
      if (level < 2) continue; // Only report elevated interference

      const coords = feat.geometry.type === 'Point'
        ? (feat.geometry.coordinates as number[])
        : (feat.geometry.coordinates as number[][])[0] ?? [];

      const lat = coords[1];
      const lon = coords[0];

      if (!lat || !lon) continue;

      signals.push({
        id: `gpsjam_${lat.toFixed(1)}_${lon.toFixed(1)}_${yesterday}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'gps_jamming',
        title: `GPS/GNSS Interference Detected (Level ${level}/3)`,
        summary: `Active GPS jamming or spoofing near ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        severity: level === 3 ? 75 : 50,
        confidence: 0.7,
        lat,
        lon,
        publishedAt: new Date(yesterday),
      });
    }

    return signals;
  }
}
