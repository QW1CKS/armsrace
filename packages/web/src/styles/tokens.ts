/** Design system tokens as JS constants (mirror of globals.css) */
export const colors = {
  bgBase: '#070B12',
  bgSurface: '#0D1420',
  bgRaised: '#111A29',
  bgOverlay: '#162135',
  textPrimary: '#E6EDF7',
  textSecondary: '#97A7C3',
  textMuted: '#5A6B87',
  info: '#4EA1FF',
  warning: '#F5B84B',
  danger: '#FF5D5D',
  success: '#49D17D',
  purple: '#A78BFA',
} as const;

/** Map a severity 0-100 to a color string */
export function severityColor(severity: number): string {
  if (severity >= 67) return colors.danger;
  if (severity >= 34) return colors.warning;
  return colors.success;
}

/** Recharts dark theme config */
export const chartTheme = {
  backgroundColor: 'transparent',
  textColor: colors.textSecondary,
  gridColor: 'rgba(150,167,195,0.08)',
  tooltipBackground: colors.bgRaised,
  tooltipBorder: 'rgba(150,167,195,0.18)',
};
