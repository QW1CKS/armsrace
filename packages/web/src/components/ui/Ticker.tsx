import React from 'react';

interface TickerItem {
  id: string;
  text: string;
  severity?: number;
}

interface TickerProps {
  items: TickerItem[];
  speed?: number; // seconds for one full scroll
}

export function Ticker({ items, speed = 60 }: TickerProps) {
  if (!items.length) return null;

  const getSeverityDot = (severity?: number) => {
    if (severity == null) return null;
    const color = severity >= 67 ? '#FF5D5D' : severity >= 34 ? '#F5B84B' : '#49D17D';
    return (
      <span style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        margin: '0 6px 0 0',
        verticalAlign: 'middle',
      }} />
    );
  };

  // Duplicate items for seamless loop
  const allItems = [...items, ...items];

  return (
    <div style={{
      overflow: 'hidden',
      background: 'var(--bg-raised)',
      borderRadius: 'var(--radius-sm)',
      padding: '6px 0',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        animation: `ticker-scroll ${speed}s linear infinite`,
        gap: '0',
      }}>
        {allItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 20px',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            borderRight: '1px solid var(--border-subtle)',
          }}>
            {getSeverityDot(item.severity)}
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
