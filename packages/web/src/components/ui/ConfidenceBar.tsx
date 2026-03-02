import React from 'react';
import { severityColor } from '../../styles/tokens.js';

interface ConfidenceBarProps {
  value: number; // 0.0-1.0
  showLabel?: boolean;
  height?: number;
}

export function ConfidenceBar({ value, showLabel = true, height = 4 }: ConfidenceBarProps) {
  const pct = Math.round(value * 100);
  const color = severityColor(100 - pct); // high confidence = success

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        flex: 1,
        height,
        background: 'var(--border-subtle)',
        borderRadius: height / 2,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: height / 2,
          transition: 'width 0.3s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: '28px' }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
