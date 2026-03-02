import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import { RSS_FEEDS, type RssFeedConfig } from './rssFeeds.config.js';
import RssParser from 'rss-parser';
import { logger } from '../../logger.js';

const parser = new RssParser({ timeout: 10000 });
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RssConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'rss_bulk',
    name: 'RSS Feed Aggregator',
    category: 'news',
    subcategory: 'rss',
    intervalMs: 10 * 60_000,
    rateLimitMs: 200,
    requiresApiKey: false,
    enabled: true,
    baseUrl: '',
    attribution: 'Various news sources via RSS',
    termsUrl: '',
  };

  protected async doFetch(): Promise<Signal[]> {
    const feeds = RSS_FEEDS;
    const allSignals: Signal[] = [];

    // Process in batches to avoid hammering too many sources at once
    for (let i = 0; i < feeds.length; i += BATCH_SIZE) {
      const batch = feeds.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map((f) => this.fetchFeed(f)));

      for (const result of results) {
        if (result.status === 'fulfilled') {
          allSignals.push(...result.value);
        }
      }

      if (i + BATCH_SIZE < feeds.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    return allSignals;
  }

  private async fetchFeed(feed: RssFeedConfig): Promise<Signal[]> {
    try {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).slice(0, 20).map((item) => ({
        id: `rss_${feed.id}_${Buffer.from(item.link ?? item.title ?? '').toString('base64').slice(0, 32)}`,
        sourceId: `rss_${feed.id}`,
        category: feed.category,
        subcategory: feed.subcategory,
        title: item.title ?? '(No title)',
        summary: item.contentSnippet?.slice(0, 300) ?? item.content?.slice(0, 300),
        severity: feed.defaultSeverity ?? 25,
        confidence: 0.6,
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      }));
    } catch (err: unknown) {
      logger.debug({ feed: feed.id, err }, 'RSS feed fetch failed');
      return [];
    }
  }
}
