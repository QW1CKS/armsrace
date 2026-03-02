import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface EonetEvent {
  id: string;
  title: string;
  description?: string;
  categories: Array<{ id: string; title: string }>;
  geometry: Array<{
    date: string;
    type: string;
    coordinates: number[] | number[][];
    magnitudeValue?: number;
    magnitudeUnit?: string;
  }>;
  sources?: Array<{ id: string; url: string }>;
}

export class NasaEonetConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'nasa_eonet',
    name: 'NASA EONET Natural Events',
    category: 'hazard',
    subcategory: 'natural_event',
    intervalMs: 15 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://eonet.gsfc.nasa.gov/api/v3',
    attribution: 'NASA Earth Observatory Natural Event Tracker',
    termsUrl: 'https://www.nasa.gov/about/highlights/HP_Privacy.html',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(
      `${this.config.baseUrl}/events?status=open&limit=100`,
    ).json<{ events: EonetEvent[] }>();

    const signals: Signal[] = [];

    for (const ev of data.events) {
      if (!ev.geometry?.length) continue;
      const latestGeom = ev.geometry[ev.geometry.length - 1];
      const coords = Array.isArray(latestGeom.coordinates[0])
        ? (latestGeom.coordinates as number[][])[0]
        : (latestGeom.coordinates as number[]);

      const categoryTitle = ev.categories[0]?.title ?? 'Natural Event';
      const severity = this.categorySeverity(ev.categories[0]?.id ?? '');

      signals.push({
        id: `eonet_${ev.id}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: ev.categories[0]?.id,
        title: ev.title,
        summary: ev.description ?? categoryTitle,
        severity,
        confidence: 0.92,
        lat: coords[1],
        lon: coords[0],
        url: ev.sources?.[0]?.url,
        publishedAt: new Date(latestGeom.date),
      });
    }

    return signals;
  }

  private categorySeverity(categoryId: string): number {
    const map: Record<string, number> = {
      wildfires: 60,
      severeStorms: 65,
      volcanoes: 70,
      floods: 55,
      drought: 45,
      earthquakes: 75,
      seaLakeIce: 30,
      landslides: 60,
      manmade: 50,
      snow: 25,
      tempExtremes: 50,
      waterColor: 20,
    };
    return map[categoryId] ?? 40;
  }
}
