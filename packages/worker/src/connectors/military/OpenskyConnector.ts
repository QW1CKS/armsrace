import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface OpenskyState {
  icao24: string;
  callsign?: string | null;
  origin_country: string;
  longitude?: number | null;
  latitude?: number | null;
  baro_altitude?: number | null;
  velocity?: number | null;
  on_ground: boolean;
  squawk?: string | null;
}

const MILITARY_SQUAWK_PATTERNS = ['7700', '7600', '7500']; // emergency squawk codes
const MILITARY_CALLSIGN_PREFIXES = ['RCH', 'REACH', 'JAKE', 'BOXER', 'NOBLE', 'SPAR', 'SAM', 'AIR'];

export class OpenskyConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'opensky',
    name: 'OpenSky Network (Aircraft)',
    category: 'military',
    subcategory: 'aviation',
    intervalMs: 10 * 60_000,
    rateLimitMs: 5000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://opensky-network.org/api',
    attribution: 'OpenSky Network',
    termsUrl: 'https://opensky-network.org/about/terms-of-use',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(`${this.config.baseUrl}/states/all`, {
      searchParams: { time: 0 },
      timeout: { request: 15000 },
    }).json<{ states?: unknown[][] }>();

    const signals: Signal[] = [];

    for (const state of data.states ?? []) {
      const s: OpenskyState = {
        icao24: state[0] as string,
        callsign: (state[1] as string | null)?.trim() || null,
        origin_country: state[2] as string,
        longitude: state[5] as number | null,
        latitude: state[6] as number | null,
        baro_altitude: state[7] as number | null,
        velocity: state[9] as number | null,
        on_ground: state[8] as boolean,
        squawk: state[14] as string | null,
      };

      const isEmergency = s.squawk && MILITARY_SQUAWK_PATTERNS.includes(s.squawk);
      const isMilCallsign = s.callsign && MILITARY_CALLSIGN_PREFIXES.some((p) => s.callsign!.startsWith(p));

      if (!isEmergency && !isMilCallsign) continue;

      const severity = s.squawk === '7700' ? 90 : s.squawk === '7500' ? 95 : 50;

      signals.push({
        id: `opensky_${s.icao24}_${Date.now()}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: isEmergency ? 'aviation_emergency' : 'military_flight',
        title: `${isEmergency ? 'EMERGENCY' : 'Military'} Aircraft: ${s.callsign ?? s.icao24}`,
        summary: `Squawk: ${s.squawk ?? 'N/A'} | Country: ${s.origin_country} | Alt: ${s.baro_altitude ?? '?'}m`,
        severity,
        confidence: 0.8,
        lat: s.latitude ?? undefined,
        lon: s.longitude ?? undefined,
        publishedAt: new Date(),
      });
    }

    return signals.slice(0, 100);
  }
}
