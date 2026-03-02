import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 24, color = 'var(--color-info)' }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="32 32"
        strokeLinecap="round"
      />
    </svg>
  );
}
