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

export function Card({ children, title, headerRight, style, className, glow = 'none', padding = '14px' }: CardProps) {
  const glowColors: Record<string, string> = {
    info: 'var(--color-info)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    success: 'var(--color-success)',
    none: 'transparent',
  };

  const borderColor = glow !== 'none' ? `${glowColors[glow]}33` : 'var(--border-subtle)';

  return (
    <div
      className={`card-surface${className ? ` ${className}` : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.02em',
          }}>
            {title}
          </span>
          {headerRight}
        </div>
      )}
      <div style={{ padding, position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
