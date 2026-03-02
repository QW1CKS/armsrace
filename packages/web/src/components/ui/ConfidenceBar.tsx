import React from 'react';
import { severityColor } from '../../styles/tokens.js';

interface ConfidenceBarProps {
  value: number; // 0.0-1.0
  showLabel?: boolean;
  height?: number;
}

export function ConfidenceBar({ value, showLabel = true, height = 4 }: ConfidenceBarProps) {
  const pct = Math.round(value * 100);
  const color = severityColor(100 - pct);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        flex: 1,
        height,
        background: 'var(--border-subtle)',
        borderRadius: height,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height,
          background: color,
          transition: 'width 0.3s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          minWidth: '28px',
        }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
