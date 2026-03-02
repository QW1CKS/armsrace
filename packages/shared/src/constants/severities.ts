export const SEVERITY_LEVELS = {
  LOW: { min: 0, max: 33, label: 'Low', color: '#49D17D' },
  MEDIUM: { min: 34, max: 66, label: 'Medium', color: '#F5B84B' },
  HIGH: { min: 67, max: 100, label: 'High', color: '#FF5D5D' },
} as const;

export function getSeverityLevel(severity: number) {
  if (severity <= 33) return SEVERITY_LEVELS.LOW;
  if (severity <= 66) return SEVERITY_LEVELS.MEDIUM;
  return SEVERITY_LEVELS.HIGH;
}
