import type { ConnectorConfig } from '@armsrace/shared';
import type { Signal } from '@armsrace/shared';
import { StaleCache } from './StaleCache.js';
import pino from 'pino';

export abstract class BaseConnector {
  abstract readonly config: ConnectorConfig;
  protected abstract doFetch(): Promise<Signal[]>;

  private _cache: StaleCache<Signal[]> | null = null;

  protected get logger() {
    return pino({
      name: this.config?.id ?? this.constructor.name,
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    });
  }

  private get cache(): StaleCache<Signal[]> {
    if (!this._cache) {
      this._cache = new StaleCache<Signal[]>(this.config.id, 3600);
    }
    return this._cache;
  }

  async fetch(): Promise<Signal[]> {
    const start = Date.now();
    try {
      const signals = await this.doFetch();
      this.cache.set(signals);
      this.logger.debug(
        { source: this.config.id, count: signals.length, ms: Date.now() - start },
        'Fetch succeeded',
      );
      return signals;
    } catch (err: unknown) {
      const stale = this.cache.get();
      this.logger.warn(
        { source: this.config.id, err, staleCount: stale?.length ?? 0, ms: Date.now() - start },
        'Fetch failed — returning stale cache',
      );
      return stale ?? [];
    }
  }

  isEnabled(): boolean {
    if (!this.config.enabled) return false;
    if (this.config.requiresApiKey && this.config.apiKeyEnvVar) {
      return !!process.env[this.config.apiKeyEnvVar]?.trim();
    }
    return true;
  }

  getStatus(): 'ok' | 'disabled' | 'missing_key' {
    if (!this.config.enabled) return 'disabled';
    if (this.config.requiresApiKey && this.config.apiKeyEnvVar) {
      if (!process.env[this.config.apiKeyEnvVar]?.trim()) return 'missing_key';
    }
    return 'ok';
  }
}
