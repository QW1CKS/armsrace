export type AlertType =
  | 'geopolitical_escalation'
  | 'military_posture'
  | 'market_shock'
  | 'cyber_spike'
  | 'infra_disruption'
  | 'convergence';

export interface AlertSource {
  name: string;
  url?: string;
}

export interface AlertEntity {
  name: string;
  type: 'country' | 'region' | 'asset' | 'organization' | 'person' | 'infrastructure';
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: number; // 0-100
  confidence: number; // 0.0-1.0
  title: string;
  body: string;
  sources: AlertSource[];
  entities: AlertEntity[];
  signalIds: string[];
  triggeredAt: Date;
  acknowledgedAt?: Date;
  dismissedAt?: Date;
}

export interface AlertPreset {
  id: string;
  type: AlertType;
  name: string;
  description: string;
  conditions: Record<string, unknown>;
  severityOverride?: number;
  enabled: boolean;
  desktopNotify: boolean;
}
