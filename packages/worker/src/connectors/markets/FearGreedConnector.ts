import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import { getDb } from '../../db/client.js';
import got from 'got';

export class FearGreedConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'fear_greed',
    name: 'Crypto Fear & Greed Index',
    category: 'market',
    subcategory: 'sentiment',
    intervalMs: 60 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://api.alternative.me/fng/',
    attribution: 'alternative.me Fear & Greed Index',
    termsUrl: 'https://alternative.me/crypto/fear-and-greed-index/',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(`${this.config.baseUrl}?limit=1`).json<{
      data: Array<{ value: string; value_classification: string; timestamp: string }>;
    }>();

    const latest = data.data?.[0];
    if (!latest) return [];

    const value = parseInt(latest.value, 10);
    const db = getDb();

    // Store as index component for analytics
    db.prepare(`
      INSERT INTO indices (name, value, components, computed_at)
      VALUES ('fear_greed', @value, @components, @computedAt)
    `).run({
      value,
      components: JSON.stringify({ raw: value, classification: latest.value_classification }),
      computedAt: Date.now(),
    });

    // Emit signal only for extremes
    if (value <= 15 || value >= 85) {
      return [{
        id: `feargreed_${latest.timestamp}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'market_sentiment',
        title: `Crypto Fear & Greed: ${latest.value_classification.toUpperCase()} (${value}/100)`,
        summary: value <= 15
          ? 'Extreme fear may signal capitulation or buying opportunity'
          : 'Extreme greed may signal market overextension',
        severity: value <= 15 ? 70 : 60,
        confidence: 0.75,
        publishedAt: new Date(parseInt(latest.timestamp, 10) * 1000),
      }];
    }

    return [];
  }
}
