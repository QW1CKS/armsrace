import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import { nanoid } from 'nanoid';
import got from 'got';

interface UsgsFeature {
  id: string;
  properties: {
    title: string;
    mag: number;
    place: string;
    time: number;
    url: string;
    alert?: string;
    tsunami?: number;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export class UsgsConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'usgs_earthquakes',
    name: 'USGS Earthquake Feed',
    category: 'hazard',
    subcategory: 'earthquake',
    intervalMs: 5 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary',
    attribution: 'U.S. Geological Survey',
    termsUrl: 'https://www.usgs.gov/policies-and-notices',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(
      `${this.config.baseUrl}/all_hour.geojson`,
    ).json<{ features: UsgsFeature[] }>();

    return data.features.map((f) => ({
      id: `usgs_${f.id}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'earthquake',
      title: f.properties.title,
      summary: `M${f.properties.mag} - ${f.properties.place}${f.properties.tsunami ? ' [TSUNAMI WARNING]' : ''}`,
      severity: Math.min(100, Math.round((Math.max(0, f.properties.mag) / 9) * 100)),
      confidence: 0.97,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      url: f.properties.url,
      publishedAt: new Date(f.properties.time),
    }));
  }
}
