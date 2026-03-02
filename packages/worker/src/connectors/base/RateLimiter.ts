import Bottleneck from 'bottleneck';

/** Per-origin rate limiter using Bottleneck */
export class RateLimiter {
  private limiters = new Map<string, Bottleneck>();

  /** Wrap an async function with rate limiting for the given origin key */
  async schedule<T>(originKey: string, minTimeMs: number, fn: () => Promise<T>): Promise<T> {
    let limiter = this.limiters.get(originKey);
    if (!limiter) {
      limiter = new Bottleneck({ minTime: minTimeMs, maxConcurrent: 1 });
      this.limiters.set(originKey, limiter);
    }
    return limiter.schedule(fn);
  }

  destroy(): void {
    for (const limiter of this.limiters.values()) {
      limiter.disconnect();
    }
    this.limiters.clear();
  }
}

/** Singleton rate limiter shared across all connectors */
export const globalRateLimiter = new RateLimiter();
