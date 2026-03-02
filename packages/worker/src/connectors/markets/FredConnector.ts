import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

const FRED_SERIES = [
  { id: 'DFF', name: 'Fed Funds Rate', subcategory: 'interest_rate' },
  { id: 'T10Y2Y', name: 'Treasury Yield Spread (10Y-2Y)', subcategory: 'yield_curve' },
  { id: 'VIXCLS', name: 'CBOE Volatility Index (VIX)', subcategory: 'volatility' },
  { id: 'DTWEXBGS', name: 'US Dollar Index (Trade Weighted)', subcategory: 'forex' },
  { id: 'CPIAUCSL', name: 'CPI (All Urban)', subcategory: 'inflation' },
];

export class FredConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'fred',
    name: 'FRED Economic Data',
    category: 'market',
    subcategory: 'macro',
    intervalMs: 6 * 60 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: true,
    apiKeyEnvVar: 'FRED_API_KEY',
    enabled: true,
    baseUrl: 'https://api.stlouisfed.org/fred/series/observations',
    attribution: 'Federal Reserve Bank of St. Louis (FRED)',
    termsUrl: 'https://fred.stlouisfed.org/legal/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const key = process.env.FRED_API_KEY!;
    const signals: Signal[] = [];

    for (const series of FRED_SERIES) {
      try {
        const data = await got(this.config.baseUrl, {
          searchParams: {
            series_id: series.id,
            api_key: key,
            file_type: 'json',
            sort_order: 'desc',
            limit: 5,
          },
        }).json<{ observations: Array<{ date: string; value: string }> }>();

        const obs = data.observations?.filter((o) => o.value !== '.');
        if (!obs?.length) continue;

        const latest = obs[0];
        const prev = obs[1];
        const latestVal = parseFloat(latest.value);
        const prevVal = prev ? parseFloat(prev.value) : latestVal;
        const delta = latestVal - prevVal;
        const pctChange = prevVal !== 0 ? (delta / Math.abs(prevVal)) * 100 : 0;

        // VIX spike = high severity signal
        if (series.id === 'VIXCLS' && latestVal > 25) {
          signals.push({
            id: `fred_${series.id}_${latest.date}`,
            sourceId: this.config.id,
            category: this.config.category,
            subcategory: series.subcategory,
            title: `${series.name}: ${latestVal.toFixed(2)} (VIX Elevated)`,
            summary: `VIX at ${latestVal.toFixed(2)}, indicating elevated market volatility. Previous: ${prevVal.toFixed(2)}`,
            severity: Math.min(100, Math.round((latestVal / 80) * 100)),
            confidence: 0.95,
            publishedAt: new Date(latest.date),
          });
        }

        // Yield curve inversion signal
        if (series.id === 'T10Y2Y' && latestVal < 0) {
          signals.push({
            id: `fred_${series.id}_${latest.date}`,
            sourceId: this.config.id,
            category: this.config.category,
            subcategory: series.subcategory,
            title: `Yield Curve Inverted: ${latestVal.toFixed(2)}%`,
            summary: `10Y-2Y spread at ${latestVal.toFixed(2)}%. Historically precedes recessions.`,
            severity: 65,
            confidence: 0.9,
            publishedAt: new Date(latest.date),
          });
        }
      } catch (_) {
        // Skip individual series failures
      }
    }

    return signals;
  }
}
