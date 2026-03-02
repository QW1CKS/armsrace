import type { ConnectorCategory } from '../types/connector.js';

export const CONNECTOR_CATEGORIES: ConnectorCategory[] = [
  'news',
  'geo',
  'hazard',
  'military',
  'cyber',
  'market',
  'infrastructure',
  'social',
];

export const CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  news: 'News & Media',
  geo: 'Geopolitical',
  hazard: 'Natural Hazards',
  military: 'Military & Aviation',
  cyber: 'Cyber Threats',
  market: 'Markets & Finance',
  infrastructure: 'Infrastructure',
  social: 'Social & OSINT',
};
