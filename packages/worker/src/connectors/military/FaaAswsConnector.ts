import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface FaaAirport {
  IATA: string;
  Name: string;
  State: string;
  City: string;
  Delay: boolean;
  DelayCount?: number;
  Status: string;
  Weather?: { Visibility?: number; Weather?: string; Temp?: string; Wind?: string };
  Reason?: string;
}

export class FaaAswsConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'faa_asws',
    name: 'FAA Airport Status',
    category: 'infrastructure',
    subcategory: 'aviation_status',
    intervalMs: 15 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://soa.smext.faa.gov/asws/api/airport/status',
    attribution: 'FAA Airport Status & Weather (ASWS)',
    termsUrl: 'https://www.fly.faa.gov/flyfaa/usmap.jsp',
  };

  // Major US hub airports
  private readonly AIRPORTS = ['EWR', 'JFK', 'LGA', 'ORD', 'ATL', 'LAX', 'SFO', 'DFW', 'DEN', 'BOS', 'MIA', 'SEA', 'IAD', 'IAH'];

  protected async doFetch(): Promise<Signal[]> {
    const results = await Promise.allSettled(
      this.AIRPORTS.map((iata) =>
        got(`${this.config.baseUrl}/${iata}`).json<FaaAirport>(),
      ),
    );

    const signals: Signal[] = [];

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const airport = result.value;
      if (!airport.Delay) continue;

      signals.push({
        id: `faa_${airport.IATA}_${new Date().toDateString()}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'airport_delay',
        title: `FAA Ground Delay: ${airport.Name} (${airport.IATA})`,
        summary: airport.Reason ?? airport.Status,
        severity: airport.DelayCount && airport.DelayCount > 10 ? 50 : 30,
        confidence: 0.95,
        publishedAt: new Date(),
      });
    }

    return signals;
  }
}
