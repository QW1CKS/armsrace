import type { AlertType } from '../types/alert.js';

export const ALERT_TYPES: AlertType[] = [
  'geopolitical_escalation',
  'military_posture',
  'market_shock',
  'cyber_spike',
  'infra_disruption',
  'convergence',
];

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  geopolitical_escalation: 'Geopolitical Escalation',
  military_posture: 'Military Posture Shift',
  market_shock: 'Market Shock',
  cyber_spike: 'Cyber Spike',
  infra_disruption: 'Infrastructure Disruption',
  convergence: 'Multi-Signal Convergence',
};
