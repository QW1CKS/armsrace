import React from 'react';

interface RiskGaugeProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  showValue?: boolean;
}

export function RiskGauge({ value, size = 80, label, showValue = true }: RiskGaugeProps) {
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clampedValue / 100);

  const getColor = (v: number) => {
    if (v >= 67) return '#f87171';
    if (v >= 34) return '#fbbf24';
    return '#4ade80';
  };

  const getLabel = (v: number) => {
    if (v >= 67) return 'CRIT';
    if (v >= 34) return 'ELEV';
    return 'NOM';
  };

  const color = getColor(clampedValue);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI * (1 - tick / 100);
          const x1 = cx + (radius + 2) * Math.cos(angle);
          const y1 = cy - (radius + 2) * Math.sin(angle);
          const x2 = cx + (radius - 3) * Math.cos(angle);
          const y2 = cy - (radius - 3) * Math.sin(angle);
          return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-muted)" strokeWidth={1} opacity={0.4} />;
        })}
        {/* Background arc */}
        <path
          d={`M ${6} ${cy} A ${radius} ${radius} 0 0 1 ${size - 6} ${cy}`}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${6} ${cy} A ${radius} ${radius} 0 0 1 ${size - 6} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
        />
        {/* Value text */}
        {showValue && (
          <>
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill={color}
              fontSize={size * 0.24}
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {Math.round(clampedValue)}
            </text>
            <text
              x={cx}
              y={cy + size * 0.1}
              textAnchor="middle"
              fill={color}
              fontSize={size * 0.08}
              fontFamily="var(--font-mono)"
              letterSpacing="0.08em"
              opacity={0.7}
            >
              {getLabel(clampedValue)}
            </text>
          </>
        )}
      </svg>
      {label && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
