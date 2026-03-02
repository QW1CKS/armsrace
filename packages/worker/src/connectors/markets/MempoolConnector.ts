import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class MempoolConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'mempool_space',
    name: 'Mempool.space (Bitcoin)',
    category: 'market',
    subcategory: 'bitcoin_network',
    intervalMs: 15 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://mempool.space/api/v1',
    attribution: 'mempool.space',
    termsUrl: 'https://mempool.space/about',
  };

  protected async doFetch(): Promise<Signal[]> {
    const [mining, fees] = await Promise.all([
      got(`${this.config.baseUrl}/mining/hashrate/3d`).json<{ hashrates: Array<{ avgHashrate: number; timestamp: number }> }>(),
      got('https://mempool.space/api/v1/fees/recommended').json<{ fastestFee: number; halfHourFee: number; minimumFee: number }>(),
    ]);

    const signals: Signal[] = [];
    const latestHashrate = mining.hashrates?.at(-1)?.avgHashrate ?? 0;
    const prevHashrate = mining.hashrates?.at(-2)?.avgHashrate ?? latestHashrate;
    const hrDrop = prevHashrate > 0 ? ((prevHashrate - latestHashrate) / prevHashrate) * 100 : 0;

    // Significant hashrate drop = potential miner capitulation or network stress
    if (hrDrop > 15) {
      signals.push({
        id: `mempool_hr_drop_${Date.now()}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'network_stress',
        title: `Bitcoin Hashrate Drop: -${hrDrop.toFixed(1)}%`,
        summary: `Network hashrate declined significantly — possible miner capitulation`,
        severity: Math.min(100, Math.round(hrDrop * 3)),
        confidence: 0.7,
        publishedAt: new Date(),
      });
    }

    // Fee spike signal
    if (fees.fastestFee > 100) {
      signals.push({
        id: `mempool_fee_spike_${Date.now()}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'network_congestion',
        title: `Bitcoin Fees Elevated: ${fees.fastestFee} sat/vB`,
        summary: `Network congestion: fast TX costs ${fees.fastestFee} sat/vB`,
        severity: 35,
        confidence: 0.85,
        publishedAt: new Date(),
      });
    }

    return signals;
  }
}
