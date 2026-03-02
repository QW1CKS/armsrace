import React from 'react';
import { severityColor } from '../../styles/tokens.js';

interface BadgeProps {
  severity?: number;
  label?: string;
  color?: string;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function Badge({ severity, label, color, size = 'md', style }: BadgeProps) {
  const c = color ?? (severity != null ? severityColor(severity) : 'var(--text-secondary)');
  const text = label ?? (severity != null ? `${severity}` : '');
  const fontSize = size === 'sm' ? '9px' : '10px';
  const padding = size === 'sm' ? '1px 6px' : '2px 8px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding,
      background: `${c}12`,
      border: `1px solid ${c}33`,
      borderRadius: '4px',
      color: c,
      fontFamily: 'var(--font-mono)',
      fontSize,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      letterSpacing: '0.04em',
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
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 6px ${color}66`,
      flexShrink: 0,
    }} />
  );
}
