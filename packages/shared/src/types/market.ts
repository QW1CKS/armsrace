export type AssetClass = 'stock' | 'fx' | 'metal' | 'crypto' | 'commodity' | 'index' | 'bond';

export interface MarketSnapshot {
  id?: number;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change24h?: number;
  changePct?: number;
  volume?: number;
  extra?: Record<string, unknown>;
  snapshotAt: Date;
}

export interface FearGreedData {
  value: number; // 0-100
  classification: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  timestamp: Date;
}

export interface MarketStressComposite {
  value: number; // 0-100
  fearGreed?: number;
  volatilityProxy?: number;
  cryptoTrend?: number;
  forexStress?: number;
  computedAt: Date;
}
