import React from 'react';
import { severityColor } from '../../styles/tokens.js';

interface AlertBadgeProps {
  count: number;
  maxDisplay?: number;
}

export function AlertBadge({ count, maxDisplay = 99 }: AlertBadgeProps) {
  if (count === 0) return null;

  const display = count > maxDisplay ? `${maxDisplay}+` : String(count);
  const color = count >= 5 ? severityColor(80) : count >= 2 ? severityColor(50) : severityColor(20);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '18px',
      height: '18px',
      padding: '0 5px',
      borderRadius: '9px',
      background: color,
      color: '#000',
      fontSize: '11px',
      fontWeight: 700,
      lineHeight: 1,
    }}>
      {display}
    </span>
  );
}
