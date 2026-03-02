import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface PolymarketMarket {
  id: string;
  question: string;
  description?: string;
  outcomes?: string[];
  outcomePrices?: string[];
  endDate?: string;
  volume?: number;
  liquidity?: number;
  active?: boolean;
  tags?: Array<{ label: string }>;
}

const GEO_TAGS = ['politics', 'geopolitics', 'war', 'military', 'elections', 'crypto', 'economy'];

export class PolymarketConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'polymarket',
    name: 'Polymarket (Prediction Markets)',
    category: 'market',
    subcategory: 'prediction_market',
    intervalMs: 30 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://clob.polymarket.com',
    attribution: 'Polymarket',
    termsUrl: 'https://polymarket.com/tos',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(`${this.config.baseUrl}/markets`, {
      searchParams: { active: true, limit: 100 },
    }).json<{ data?: PolymarketMarket[] } | PolymarketMarket[]>();

    const markets = Array.isArray(data) ? data : (data.data ?? []);

    return markets
      .filter((m) => m.active && m.volume && m.volume > 100_000)
      .slice(0, 30)
      .map((m) => {
        const prices = m.outcomePrices?.map(parseFloat) ?? [];
        const maxPrice = Math.max(...prices);
        const severity = Math.round(Math.max(maxPrice, 1 - maxPrice) * 80);

        return {
          id: `poly_${m.id}`,
          sourceId: this.config.id,
          category: this.config.category,
          subcategory: 'prediction_market',
          title: m.question,
          summary: `Volume: $${((m.volume ?? 0) / 1000).toFixed(0)}K | Outcomes: ${(m.outcomes ?? []).map((o, i) => `${o}: ${((prices[i] ?? 0) * 100).toFixed(0)}%`).join(', ')}`,
          severity,
          confidence: 0.65,
          publishedAt: m.endDate ? new Date(m.endDate) : new Date(),
        };
      });
  }
}
