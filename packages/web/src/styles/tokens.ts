/** ARMSRACE — Map-First Command Interface Tokens */
export const colors = {
  bgBase: '#0a0e17',
  bgSurface: 'rgba(10, 14, 23, 0.88)',
  bgRaised: '#111827',
  bgOverlay: 'rgba(10, 14, 23, 0.72)',
  bgPanel: 'rgba(10, 14, 23, 0.92)',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  textBright: '#ffffff',
  info: '#38bdf8',
  warning: '#fbbf24',
  danger: '#f87171',
  success: '#4ade80',
  purple: '#a78bfa',
  cyan: '#22d3ee',
  amber: '#fbbf24',
} as const;

/** Map severity 0-100 to color */
export function severityColor(severity: number): string {
  if (severity >= 67) return colors.danger;
  if (severity >= 34) return colors.warning;
  return colors.success;
}

/** Recharts theme */
export const chartTheme = {
  backgroundColor: 'transparent',
  text: colors.textSecondary,
  textColor: colors.textSecondary,
  grid: 'rgba(148, 163, 184, 0.06)',
  gridColor: 'rgba(148, 163, 184, 0.06)',
  tooltipBg: colors.bgRaised,
  tooltipBackground: colors.bgRaised,
  tooltipBorder: 'rgba(148, 163, 184, 0.12)',
  colors: [colors.info, colors.danger, colors.warning, colors.success, colors.purple],
};
