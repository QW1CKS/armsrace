import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface UcdpEvent {
  id: string;
  conflict_name: string;
  country: string;
  country_id: string;
  region: string;
  year: number;
  date_start: string;
  date_end: string;
  deaths_a: number;
  deaths_b: number;
  deaths_civilians: number;
  deaths_unknown: number;
  best: number;
  type_of_violence: 1 | 2 | 3;
  latitude?: number;
  longitude?: number;
}

export class UcdpConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'ucdp',
    name: 'UCDP Conflict Data',
    category: 'geo',
    subcategory: 'armed_conflict',
    intervalMs: 24 * 60 * 60_000, // daily
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: false, // UCDP API now requires authentication
    baseUrl: 'https://ucdpapi.pcr.uu.se/api/gedevents',
    attribution: 'Uppsala Conflict Data Program (UCDP)',
    termsUrl: 'https://ucdp.uu.se/pages/faq.html',
  };

  protected async doFetch(): Promise<Signal[]> {
    // Get recent events from UCDP API
    const year = new Date().getFullYear();
    const data = await got(`${this.config.baseUrl}/${year}?pagesize=100`, {
      headers: { Accept: 'application/json' },
    }).json<{ Result: UcdpEvent[] }>();

    const violenceLabels: Record<number, string> = {
      1: 'State-based conflict',
      2: 'Non-state conflict',
      3: 'One-sided violence',
    };

    return (data.Result ?? []).map((ev) => {
      const totalDeaths = ev.best ?? (ev.deaths_a + ev.deaths_b + ev.deaths_civilians + ev.deaths_unknown);
      const severity = Math.min(100, Math.round(20 + (totalDeaths / 100) * 80));

      return {
        id: `ucdp_${ev.id}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'armed_conflict',
        title: ev.conflict_name,
        summary: `${violenceLabels[ev.type_of_violence] ?? 'Conflict'} in ${ev.country} — Est. ${totalDeaths} deaths`,
        severity,
        confidence: 0.88,
        lat: ev.latitude,
        lon: ev.longitude,
        countryCode: ev.country_id?.slice(0, 2).toUpperCase(),
        region: ev.region,
        publishedAt: new Date(ev.date_start),
      };
    });
  }
}
