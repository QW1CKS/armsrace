import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class ArxivConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'arxiv',
    name: 'arXiv (Security/AI papers)',
    category: 'news',
    subcategory: 'research',
    intervalMs: 6 * 60 * 60_000,
    rateLimitMs: 3000,
    requiresApiKey: false,
    enabled: true,
    baseUrl: 'https://export.arxiv.org/api/query',
    attribution: 'arXiv.org',
    termsUrl: 'https://arxiv.org/help/license',
  };

  protected async doFetch(): Promise<Signal[]> {
    // Search for papers on AI safety, cybersecurity, WMD, nuclear, etc.
    const query = 'cat:cs.CR OR cat:eess.SY ti:cyber OR ti:security OR ti:vulnerability OR ti:attack';
    const xml = await got(`${this.config.baseUrl}?search_query=${encodeURIComponent(query)}&max_results=20&sortBy=submittedDate&sortOrder=descending`).text();

    // Parse atom XML manually (lightweight)
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

    return entries.map((match) => {
      const entry = match[1];
      const title = this.extract(entry, 'title');
      const id = this.extract(entry, 'id');
      const published = this.extract(entry, 'published');
      const summary = this.extract(entry, 'summary')?.slice(0, 200);

      return {
        id: `arxiv_${id?.split('/').pop() ?? Math.random().toString(36).slice(2)}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'research',
        title: title ?? '(No title)',
        summary,
        severity: 20,
        confidence: 0.5,
        url: id,
        publishedAt: published ? new Date(published) : new Date(),
      };
    });
  }

  private extract(xml: string, tag: string): string | undefined {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
    return match?.[1]?.trim();
  }
}
