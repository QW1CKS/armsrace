import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import { getDb } from '../../db/client.js';
import got from 'got';

const TOP_COINS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
  'ripple', 'usd-coin', 'cardano', 'avalanche-2', 'dogecoin',
];

export class CoinGeckoConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'coingecko',
    name: 'CoinGecko',
    category: 'market',
    subcategory: 'crypto',
    intervalMs: 5 * 60_000,
    rateLimitMs: 2000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://api.coingecko.com/api/v3',
    attribution: 'CoinGecko',
    termsUrl: 'https://www.coingecko.com/en/terms',
  };

  protected async doFetch(): Promise<Signal[]> {
    const data = await got(`${this.config.baseUrl}/coins/markets`, {
      searchParams: {
        vs_currency: 'usd',
        ids: TOP_COINS.join(','),
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        price_change_percentage: '24h',
      },
    }).json<Array<{
      id: string;
      symbol: string;
      name: string;
      current_price: number;
      price_change_24h: number;
      price_change_percentage_24h: number;
      total_volume: number;
    }>>();

    const db = getDb();
    const insertSnap = db.prepare(`
      INSERT INTO market_snapshots (symbol, name, asset_class, price, change_24h, change_pct, volume, snapshot_at)
      VALUES (@symbol, @name, @assetClass, @price, @change24h, @changePct, @volume, @snapshotAt)
    `);

    const now = Date.now();
    const insertMany = db.transaction((rows: typeof data) => {
      for (const c of rows) {
        insertSnap.run({
          symbol: c.symbol.toUpperCase(),
          name: c.name,
          assetClass: 'crypto',
          price: c.current_price,
          change24h: c.price_change_24h,
          changePct: c.price_change_percentage_24h,
          volume: c.total_volume,
          snapshotAt: now,
        });
      }
    });

    insertMany(data);

    // Emit signal for large moves
    return data
      .filter((c) => Math.abs(c.price_change_percentage_24h ?? 0) >= 10)
      .map((c) => ({
        id: `cg_shock_${c.id}_${now}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'crypto_shock',
        title: `${c.name}: ${c.price_change_percentage_24h > 0 ? '+' : ''}${c.price_change_percentage_24h.toFixed(1)}% in 24h`,
        summary: `Price: $${c.current_price.toLocaleString()} | Volume: $${(c.total_volume / 1e9).toFixed(2)}B`,
        severity: Math.min(100, Math.round(Math.abs(c.price_change_percentage_24h) * 5)),
        confidence: 0.9,
        publishedAt: new Date(),
      }));
  }
}
