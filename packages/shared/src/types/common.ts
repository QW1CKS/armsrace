export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

export type TimeWindow = '1h' | '6h' | '24h' | '7d' | 'custom';

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  dbConnected: boolean;
  redisConnected: boolean;
  activeConnectors: number;
  totalSignals24h: number;
  timestamp: Date;
}
