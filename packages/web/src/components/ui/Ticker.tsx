import React from 'react';

interface TickerItem {
  id: string;
  text: string;
  severity?: number;
}

interface TickerProps {
  items: TickerItem[];
  speed?: number;
}

export function Ticker({ items, speed = 60 }: TickerProps) {
  if (!items.length) return null;

  const getSeverityDot = (severity?: number) => {
    if (severity == null) return null;
    const color = severity >= 67 ? '#f87171' : severity >= 34 ? '#fbbf24' : '#4ade80';
    return (
      <span style={{
        display: 'inline-block',
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 4px ${color}66`,
        margin: '0 6px 0 0',
        verticalAlign: 'middle',
      }} />
    );
  };

  const allItems = [...items, ...items];

  return (
    <div className="widget-card" style={{
      overflow: 'hidden',
      padding: '6px 0',
      position: 'relative',
      borderRadius: 'var(--radius-md)',
    }}>
      {/* Label */}
      <span style={{
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '0.06em',
        color: 'var(--text-muted)',
        zIndex: 2,
        background: 'var(--bg-glass)',
        padding: '0 6px 0 0',
      }}>
        FEED
      </span>
      <div style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        animation: `ticker-scroll ${speed}s linear infinite`,
        marginLeft: '46px',
      }}>
        {allItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 16px',
            fontSize: '11px',
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
