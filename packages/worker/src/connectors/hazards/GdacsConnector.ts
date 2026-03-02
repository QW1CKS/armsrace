import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface GdacsEvent {
  eventid: number;
  eventtype: string;
  eventname: string;
  alertlevel: 'Green' | 'Orange' | 'Red';
  severity: { value: number; unit: string; description: string };
  country: string;
  iso3: string;
  fromdate: string;
  todate: string;
  latitude?: number;
  longitude?: number;
  description: { problem?: string };
  url: { report?: string };
}

export class GdacsConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'gdacs',
    name: 'GDACS Global Disaster Alert',
    category: 'hazard',
    subcategory: 'disaster',
    intervalMs: 20 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH',
    attribution: 'Global Disaster Alert and Coordination System (GDACS)',
    termsUrl: 'https://www.gdacs.org/About/policy/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(
      this.config.baseUrl + '?alertlevel=Green,Orange,Red&eventlist=EQ,TC,FL,VO,DR,WF&limit=100',
      {
        headers: { Accept: 'application/json' },
      },
    ).json<{ features?: Array<{ properties: GdacsEvent; geometry: { coordinates: [number, number] } }> }>();

    if (!data.features) return [];

    return data.features.map((f) => {
      const ev = f.properties;
      const alertSeverity = { Green: 25, Orange: 60, Red: 85 }[ev.alertlevel] ?? 40;

      return {
        id: `gdacs_${ev.eventid}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: ev.eventtype.toLowerCase(),
        title: `${ev.alertlevel} Alert: ${ev.eventname || ev.eventtype}`,
        summary: ev.description?.problem ?? `${ev.severity?.description ?? ''} in ${ev.country}`,
        severity: alertSeverity,
        confidence: 0.9,
        lat: f.geometry?.coordinates[1] ?? undefined,
        lon: f.geometry?.coordinates[0] ?? undefined,
        countryCode: ev.iso3?.slice(0, 2),
        url: ev.url?.report,
        publishedAt: new Date(ev.fromdate),
      };
    });
  }
}
