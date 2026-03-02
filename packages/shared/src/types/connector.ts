export type ConnectorCategory =
  | 'news'
  | 'geo'
  | 'hazard'
  | 'military'
  | 'cyber'
  | 'market'
  | 'infrastructure'
  | 'social';

export interface ConnectorConfig {
  id: string;
  name: string;
  category: ConnectorCategory;
  subcategory?: string;
  /** Polling interval in milliseconds */
  intervalMs: number;
  /** Minimum ms between consecutive requests to the same source */
  rateLimitMs: number;
  requiresApiKey: boolean;
  /** Name of the env var that holds the API key */
  apiKeyEnvVar?: string;
  enabled: boolean;
  baseUrl: string;
  /** Human-readable source attribution */
  attribution?: string;
  /** Terms of use URL */
  termsUrl?: string;
}

export type ConnectorStatus = 'ok' | 'error' | 'rate_limited' | 'disabled' | 'pending';

export interface SourceHealth {
  sourceId: string;
  lastFetchAt?: Date;
  lastSuccessAt?: Date;
  status: ConnectorStatus;
  errorMsg?: string;
  totalFetches: number;
  totalSignals: number;
}
