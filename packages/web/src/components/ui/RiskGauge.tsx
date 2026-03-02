import React from 'react';

interface RiskGaugeProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  showValue?: boolean;
}

export function RiskGauge({ value, size = 80, label, showValue = true }: RiskGaugeProps) {
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius; // half circle
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clampedValue / 100);

  const getColor = (v: number) => {
    if (v >= 67) return '#FF5D5D';
    if (v >= 34) return '#F5B84B';
    return '#49D17D';
  };

  const color = getColor(clampedValue);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        {/* Background arc */}
        <path
          d={`M ${6} ${cy} A ${radius} ${radius} 0 0 1 ${size - 6} ${cy}`}
          fill="none"
          stroke="var(--border-muted)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${6} ${cy} A ${radius} ${radius} 0 0 1 ${size - 6} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
        />
        {/* Value text */}
        {showValue && (
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fill={color}
            fontSize={size * 0.22}
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {Math.round(clampedValue)}
          </text>
        )}
      </svg>
      {label && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      )}
    </div>
  );
}
