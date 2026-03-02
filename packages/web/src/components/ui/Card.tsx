import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  headerRight?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  glow?: 'info' | 'warning' | 'danger' | 'success' | 'none';
  padding?: string | number;
}

export function Card({ children, title, headerRight, style, className, glow = 'none', padding = '16px' }: CardProps) {
  const glowColors: Record<string, string> = {
    info: '#4EA1FF',
    warning: '#F5B84B',
    danger: '#FF5D5D',
    success: '#49D17D',
    none: 'transparent',
  };

  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${glow !== 'none' ? `${glowColors[glow]}33` : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: glow !== 'none'
          ? `var(--shadow-card), 0 0 12px ${glowColors[glow]}22`
          : 'var(--shadow-card)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {title}
          </span>
          {headerRight}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
    </div>
  );
}
