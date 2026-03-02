import type { ConnectorCategory } from './connector.js';

export type SignalSeverity = number; // 0-100
export type SignalConfidence = number; // 0.0-1.0

export interface Signal {
  id: string;
  sourceId: string;
  category: ConnectorCategory;
  subcategory?: string;
  title: string;
  summary?: string;
  severity: SignalSeverity;
  confidence: SignalConfidence;
  lat?: number;
  lon?: number;
  countryCode?: string;
  region?: string;
  url?: string;
  rawJson?: unknown;
  publishedAt: Date;
  ingestedAt?: Date;
  isStale?: boolean;
}

export interface GeoEvent {
  id: string;
  signalId: string;
  lat: number;
  lon: number;
  magnitude: number;
  eventType: string;
  timestamp: Date;
}
