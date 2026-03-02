/** In-memory TTL cache for stale-on-error fallback */
export class StaleCache<T> {
  private data: T | null = null;
  private cachedAt: number | null = null;
  private readonly ttlMs: number;
  private readonly key: string;

  constructor(key: string, ttlSeconds: number) {
    this.key = key;
    this.ttlMs = ttlSeconds * 1000;
  }

  set(value: T): void {
    this.data = value;
    this.cachedAt = Date.now();
  }

  get(): T | null {
    if (this.data === null || this.cachedAt === null) return null;
    const age = Date.now() - this.cachedAt;
    if (age > this.ttlMs) {
      // Return stale data anyway — better than nothing
      return this.data;
    }
    return this.data;
  }

  isExpired(): boolean {
    if (this.cachedAt === null) return true;
    return Date.now() - this.cachedAt > this.ttlMs;
  }

  clear(): void {
    this.data = null;
    this.cachedAt = null;
  }

  get cacheKey(): string {
    return this.key;
  }
}
