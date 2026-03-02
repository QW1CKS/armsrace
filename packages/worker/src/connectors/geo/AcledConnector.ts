import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';
import { logger } from '../../logger.js';

interface AcledEvent {
  event_id_cnty: string;
  event_date: string;
  event_type: string;
  sub_event_type: string;
  country: string;
  iso: number;
  region: string;
  latitude: string;
  longitude: string;
  notes: string;
  fatalities: string;
  actor1: string;
  actor2?: string;
  source: string;
}

interface OAuthToken {
  access_token: string;
  refresh_token: string;
  expiresAt: number; // epoch ms
}

// Module-level token cache — persists across connector runs within the same process
let cachedToken: OAuthToken | null = null;

async function getAccessToken(): Promise<string> {
  const email = process.env.ACLED_EMAIL ?? '';
  const password = process.env.ACLED_PASSWORD ?? '';
  if (!email || !password) throw new Error('ACLED_EMAIL and ACLED_PASSWORD must be set');

  // Return cached token if still valid (5-min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60_000) {
    return cachedToken.access_token;
  }

  // Try refresh token first
  if (cachedToken?.refresh_token) {
    try {
      const res = await got.post('https://acleddata.com/oauth/token', {
        form: { refresh_token: cachedToken.refresh_token, grant_type: 'refresh_token', client_id: 'acled' },
      }).json<{ access_token: string; refresh_token: string; expires_in: number }>();
      cachedToken = { access_token: res.access_token, refresh_token: res.refresh_token, expiresAt: Date.now() + res.expires_in * 1000 };
      return cachedToken.access_token;
    } catch {
      logger.debug('ACLED refresh token failed, re-authenticating');
    }
  }

  // Full password authentication
  const res = await got.post('https://acleddata.com/oauth/token', {
    form: { username: email, password, grant_type: 'password', client_id: 'acled' },
  }).json<{ access_token: string; refresh_token: string; expires_in: number }>();

  cachedToken = { access_token: res.access_token, refresh_token: res.refresh_token, expiresAt: Date.now() + res.expires_in * 1000 };
  return cachedToken.access_token;
}

export class AcledConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'acled',
    name: 'ACLED Conflict Events',
    category: 'geo',
    subcategory: 'acled_event',
    intervalMs: 6 * 60 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: true,
    apiKeyEnvVar: 'ACLED_EMAIL',
    enabled: true,
    baseUrl: 'https://acleddata.com/api/acled/read',
    attribution: 'Armed Conflict Location & Event Data Project (ACLED)',
    termsUrl: 'https://acleddata.com/terms-and-conditions-of-use/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const token = await getAccessToken();
    const since = new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString().split('T')[0];

    const data = await got(this.config.baseUrl, {
      headers: { Authorization: `Bearer ${token}` },
      searchParams: {
        _format: 'json',
        event_date: since,
        event_date_where: 'BETWEEN',
        event_date_end: new Date().toISOString().split('T')[0],
        limit: 200,
        fields: 'event_id_cnty|event_date|event_type|sub_event_type|country|iso|region|latitude|longitude|notes|fatalities|actor1|actor2|source',
      },
    }).json<{ data: AcledEvent[] }>();

    return (data.data ?? []).map((ev) => {
      const fatalities = parseInt(ev.fatalities, 10) || 0;
      const severity = Math.min(100, 30 + fatalities * 2 + (ev.event_type === 'Explosions/Remote violence' ? 20 : 0));
      return {
        id: `acled_${ev.event_id_cnty}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: ev.event_type?.toLowerCase().replace(/[\s/]+/g, '_'),
        title: `${ev.event_type}: ${ev.actor1}${ev.actor2 ? ` vs ${ev.actor2}` : ''}`,
        summary: `${ev.sub_event_type} in ${ev.country}. Fatalities: ${ev.fatalities}. ${ev.notes?.slice(0, 200) ?? ''}`,
        severity,
        confidence: 0.85,
        lat: parseFloat(ev.latitude) || undefined,
        lon: parseFloat(ev.longitude) || undefined,
        countryCode: String(ev.iso).slice(0, 2),
        region: ev.region,
        publishedAt: new Date(ev.event_date),
      };
    });
  }
}
