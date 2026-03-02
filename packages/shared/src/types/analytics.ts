export type IndexName =
  | 'global_instability'
  | 'market_stress'
  | 'infra_stress'
  | 'info_velocity'
  | 'cyber_threat'
  | 'escalation';

export interface IndexSnapshot {
  id?: number;
  name: IndexName;
  value: number; // 0.0-100.0
  components: Record<string, number>;
  computedAt: Date;
}

export interface EscalationScore {
  countryCode: string;
  countryName: string;
  score: number;
  trend: 'rising' | 'falling' | 'stable';
  delta24h: number;
  topSignals: string[];
  computedAt: Date;
}

export interface AnomalyScore {
  sourceId: string;
  category: string;
  zScore: number;
  isAnomalous: boolean;
  currentRate: number;
  baselineRate: number;
  windowSize: number;
}
