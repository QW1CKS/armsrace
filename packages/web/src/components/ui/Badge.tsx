import React from 'react';
import { severityColor } from '../../styles/tokens.js';

interface BadgeProps {
  severity?: number;
  label?: string;
  color?: string;
  style?: React.CSSProperties;
}

export function Badge({ severity, label, color, style }: BadgeProps) {
  const c = color ?? (severity != null ? severityColor(severity) : 'var(--text-secondary)');
  const text = label ?? (severity != null ? `${severity}` : '');

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 7px',
      borderRadius: '10px',
      background: `${c}22`,
      border: `1px solid ${c}44`,
      color: c,
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {text}
    </span>
  );
}

interface SeverityDotProps {
  severity: number;
}

export function SeverityDot({ severity }: SeverityDotProps) {
  const color = severityColor(severity);
  return (
    <span style={{
      display: 'inline-block',
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }} />
  );
}
