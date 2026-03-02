import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

interface AbuseIpRecord {
  ipAddress: string;
  abuseConfidenceScore: number;
  countryCode?: string;
  domain?: string;
  isTor?: boolean;
  totalReports: number;
  lastReportedAt?: string;
  usageType?: string;
}

export class AbuseIpdbConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    category: 'cyber',
    subcategory: 'malicious_ip',
    intervalMs: 2 * 60 * 60_000,
    rateLimitMs: 1000,
    requiresApiKey: true,
    apiKeyEnvVar: 'ABUSEIPDB_API_KEY',
    enabled: true,
    baseUrl: 'https://api.abuseipdb.com/api/v2',
    attribution: 'AbuseIPDB',
    termsUrl: 'https://www.abuseipdb.com/legal',
  };

  protected async doFetch(): Promise<Signal[]> {
    const key = process.env.ABUSEIPDB_API_KEY!;
    const data = await got(`${this.config.baseUrl}/blacklist`, {
      headers: { Key: key, Accept: 'application/json' },
      searchParams: { confidenceMinimum: 90, limit: 100 },
    }).json<{ data: AbuseIpRecord[] }>();

    return (data.data ?? []).map((r) => ({
      id: `abuseipdb_${r.ipAddress}`,
      sourceId: this.config.id,
      category: this.config.category,
      subcategory: 'malicious_ip',
      title: `High-Confidence Malicious IP: ${r.ipAddress}`,
      summary: `Confidence: ${r.abuseConfidenceScore}% | Reports: ${r.totalReports}${r.isTor ? ' | TOR exit node' : ''}`,
      severity: Math.round((r.abuseConfidenceScore / 100) * 80),
      confidence: r.abuseConfidenceScore / 100,
      countryCode: r.countryCode,
      publishedAt: r.lastReportedAt ? new Date(r.lastReportedAt) : new Date(),
    }));
  }
}
