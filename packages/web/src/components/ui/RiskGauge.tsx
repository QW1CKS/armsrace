import React from 'react';

interface RiskGaugeProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  showValue?: boolean;
}

export function RiskGauge({ value, size = 80, label, showValue = true }: RiskGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clampedValue / 100);

  const getColor = (v: number) => {
    if (v >= 67) return '#f87171';
    if (v >= 34) return '#fbbf24';
    return '#4ade80';
  };

  const getLabel = (v: number) => {
    if (v >= 67) return 'CRITICAL';
    if (v >= 34) return 'ELEVATED';
    return 'NOMINAL';
  };

  const color = getColor(clampedValue);
  const cx = size / 2;
  const cy = size / 2;
  const filterId = `glow-${label ?? 'gauge'}`.replace(/\s+/g, '-');

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Fine tick marks */}
        {Array.from({ length: 21 }, (_, i) => i * 5).map((tick) => {
          const angle = Math.PI * (1 - tick / 100);
          const isMajor = tick % 25 === 0;
          const outerR = radius + 4;
          const innerR = isMajor ? radius - 4 : radius - 1;
          const x1 = cx + outerR * Math.cos(angle);
          const y1 = cy - outerR * Math.sin(angle);
          const x2 = cx + innerR * Math.cos(angle);
          const y2 = cy - innerR * Math.sin(angle);
          return (
            <line
              key={tick}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? 'var(--text-secondary)' : 'var(--text-muted)'}
              strokeWidth={isMajor ? 1.5 : 0.6}
              opacity={isMajor ? 0.6 : 0.3}
            />
          );
        })}
        {/* Background arc */}
        <path
          d={`M ${8} ${cy} A ${radius} ${radius} 0 0 1 ${size - 8} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* Glow arc (behind) */}
        <path
          d={`M ${8} ${cy} A ${radius} ${radius} 0 0 1 ${size - 8} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          filter={`url(#${filterId})`}
          opacity={0.5}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
        />
        {/* Value arc */}
        <path
          d={`M ${8} ${cy} A ${radius} ${radius} 0 0 1 ${size - 8} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
        />
        {/* Needle */}
        {(() => {
          const needleAngle = Math.PI * (1 - clampedValue / 100);
          const needleLength = radius - 10;
          const nx = cx + needleLength * Math.cos(needleAngle);
          const ny = cy - needleLength * Math.sin(needleAngle);
          return (
            <>
              <line
                x1={cx} y1={cy} x2={nx} y2={ny}
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.7}
                style={{ transition: 'all 0.8s ease' }}
              />
              <circle cx={cx} cy={cy} r={2.5} fill={color} opacity={0.8} />
            </>
          );
        })()}
        {/* Value text */}
        {showValue && (
          <>
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fill={color}
              fontSize={size * 0.26}
              fontWeight="800"
              fontFamily="var(--font-mono)"
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            >
              {Math.round(clampedValue)}
            </text>
            <text
              x={cx}
              y={cy + size * 0.08}
              textAnchor="middle"
              fill={color}
              fontSize={Math.max(7, size * 0.065)}
              fontFamily="var(--font-mono)"
              letterSpacing="0.12em"
              opacity={0.8}
            >
              {getLabel(clampedValue)}
            </text>
          </>
        )}
      </svg>
      {label && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
