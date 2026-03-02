import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class HackerNewsConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'hackernews',
    name: 'Hacker News (Top)',
    category: 'news',
    subcategory: 'tech_security',
    intervalMs: 30 * 60_000,
    rateLimitMs: 500,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://hacker-news.firebaseio.com/v0',
    attribution: 'Hacker News (Y Combinator)',
    termsUrl: 'https://news.ycombinator.com/item?id=17821439',
  };

  private readonly SECURITY_KEYWORDS = [
    'breach', 'hack', 'ransomware', 'zero-day', 'cve', 'vulnerability',
    'exploit', 'malware', 'ddos', 'botnet', 'phishing', 'critical',
    'military', 'war', 'conflict', 'attack', 'nuclear', 'china', 'russia',
    'ukraine', 'cyber', 'spyware', 'backdoor', 'nsa', 'cia', 'sanctions',
  ];

  protected async doFetch(): Promise<Signal[]> {
    const ids = await got(`${this.config.baseUrl}/topstories.json`).json<number[]>();
    const top50 = ids.slice(0, 50);

    const items = await Promise.allSettled(
      top50.map((id) =>
        got(`${this.config.baseUrl}/item/${id}.json`).json<{
          id: number;
          title: string;
          url?: string;
          score: number;
          time: number;
          by: string;
        }>(),
      ),
    );

    const signals: Signal[] = [];

    for (const result of items) {
      if (result.status !== 'fulfilled') continue;
      const item = result.value;
      if (!item?.title) continue;

      const titleLower = item.title.toLowerCase();
      const isRelevant = this.SECURITY_KEYWORDS.some((kw) => titleLower.includes(kw));
      if (!isRelevant) continue;

      signals.push({
        id: `hn_${item.id}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'tech_security',
        title: item.title,
        summary: `HN Score: ${item.score} | By: ${item.by}`,
        severity: Math.min(80, Math.round(item.score / 10)),
        confidence: 0.55,
        url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
        publishedAt: new Date(item.time * 1000),
      });
    }

    return signals;
  }
}
