import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import { getDb } from '../../db/client.js';
import got from 'got';

const SYMBOLS = [
  // Stocks
  { symbol: 'SPY', name: 'S&P 500 ETF', assetClass: 'index' },
  { symbol: 'QQQ', name: 'Nasdaq ETF', assetClass: 'index' },
  { symbol: 'GLD', name: 'Gold ETF', assetClass: 'metal' },
  { symbol: 'SLV', name: 'Silver ETF', assetClass: 'metal' },
  { symbol: 'USO', name: 'US Oil Fund', assetClass: 'commodity' },
  { symbol: 'TLT', name: 'US 20Y Bonds', assetClass: 'bond' },
  // Forex (via Yahoo Finance pairs)
  { symbol: 'EURUSD=X', name: 'EUR/USD', assetClass: 'fx' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', assetClass: 'fx' },
  { symbol: 'USDJPY=X', name: 'USD/JPY', assetClass: 'fx' },
  { symbol: 'USDCNY=X', name: 'USD/CNY', assetClass: 'fx' },
  // Crypto via Yahoo Finance
  { symbol: 'BTC-USD', name: 'Bitcoin', assetClass: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', assetClass: 'crypto' },
];

/* ── Yahoo Finance crumb authentication ──────────────────────── */
let cachedCrumb: string | null = null;
let cachedCookies: string | null = null;
let crumbExpiry = 0;
const CRUMB_TTL = 30 * 60_000; // 30 min

const YF_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function getYahooCrumb(): Promise<{ crumb: string; cookies: string }> {
  if (cachedCrumb && cachedCookies && Date.now() < crumbExpiry) {
    return { crumb: cachedCrumb, cookies: cachedCookies };
  }

  // Step 1: Hit Yahoo to collect cookies
  const consentRes = await got('https://fc.yahoo.com/', {
    headers: { 'User-Agent': YF_UA },
    followRedirect: true,
    throwHttpErrors: false,
  });
  const rawCookies = consentRes.headers['set-cookie'] ?? [];
  const cookieStr = rawCookies.map((c) => c.split(';')[0]).join('; ');

  // Step 2: Fetch crumb using those cookies
  const crumb = await got('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': YF_UA, Cookie: cookieStr },
  }).text();

  cachedCrumb = crumb;
  cachedCookies = cookieStr;
  crumbExpiry = Date.now() + CRUMB_TTL;

  return { crumb, cookies: cookieStr };
}

export class YahooFinanceConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'yahoo_finance',
    name: 'Yahoo Finance',
    category: 'market',
    subcategory: 'price_feed',
    intervalMs: 5 * 60_000,
    rateLimitMs: 500,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://query2.finance.yahoo.com/v7/finance/quote',
    attribution: 'Yahoo Finance (unofficial public endpoint)',
    termsUrl: 'https://legal.yahoo.com/us/en/yahoo/terms/product-atos/finance/index.html',
  };

  protected async doFetch(): Promise<Signal[]> {
    const symbolStr = SYMBOLS.map((s) => s.symbol).join(',');

    // Get authenticated crumb + cookies
    const { crumb, cookies } = await getYahooCrumb();

    const data = await got('https://query2.finance.yahoo.com/v7/finance/quote', {
      searchParams: {
        symbols: symbolStr,
        crumb,
        fields: 'regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,shortName',
      },
      headers: {
        'User-Agent': YF_UA,
        Accept: 'application/json',
        Cookie: cookies,
      },
    }).json<{ quoteResponse?: { result?: Array<Record<string, unknown>> } }>();

    const results = data.quoteResponse?.result ?? [];
    const db = getDb();

    const insertSnap = db.prepare(`
      INSERT INTO market_snapshots (symbol, name, asset_class, price, change_24h, change_pct, volume, snapshot_at)
      VALUES (@symbol, @name, @assetClass, @price, @change24h, @changePct, @volume, @snapshotAt)
    `);

    const now = Date.now();
    db.exec('BEGIN');
    try {
      for (const r of results) {
        const meta = SYMBOLS.find((s) => s.symbol === r.symbol) ?? { name: String(r.shortName ?? r.symbol), assetClass: 'stock' };
        insertSnap.run({
          symbol: r.symbol,
          name: meta.name,
          assetClass: meta.assetClass,
          price: r.regularMarketPrice ?? 0,
          change24h: r.regularMarketChange ?? null,
          changePct: r.regularMarketChangePercent ?? null,
          volume: r.regularMarketVolume ?? null,
          snapshotAt: now,
        });
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    // Return market shock signals for large moves
    return results
      .filter((r) => Math.abs(Number(r.regularMarketChangePercent ?? 0)) >= 3)
      .map((r) => ({
        id: `yf_shock_${r.symbol}_${now}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'market_shock',
        title: `${r.symbol}: ${Number(r.regularMarketChangePercent ?? 0) > 0 ? '+' : ''}${Number(r.regularMarketChangePercent ?? 0).toFixed(1)}% move`,
        summary: `Price: ${r.regularMarketPrice}`,
        severity: Math.min(100, Math.round(Math.abs(Number(r.regularMarketChangePercent ?? 0)) * 8)),
        confidence: 0.92,
        publishedAt: new Date(),
      }));
  }
}
