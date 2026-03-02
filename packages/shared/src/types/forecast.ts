export type ForecastHorizon = '24h' | '72h' | '7d';
export type ForecastSubjectType = 'global' | 'region' | 'country' | 'asset';

export interface Forecast {
  id: string;
  horizon: ForecastHorizon;
  subject: string;
  subjectType: ForecastSubjectType;
  /** 0.0–1.0 probability of the predicted event/trend */
  probability: number;
  narrative: string;
  confidence: number; // 0.0-1.0
  signalBasis: string[];
  generatedAt: Date;
}

export const FORECAST_DISCLAIMER =
  'Prophecies are speculative scenario outputs, not factual predictions.' as const;

export const APP_DISCLAIMER =
  'Armsrace Monitor provides informational analytics and scenario modeling only. ' +
  'Predictions and prophecies are probabilistic/speculative outputs, not guarantees or advice. ' +
  'Always verify critical decisions with primary sources.' as const;
