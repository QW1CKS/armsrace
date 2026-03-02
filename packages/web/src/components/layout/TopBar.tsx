import React, { useEffect, useState } from 'react';
import { useIndices } from '../../hooks/useIndices.js';
import { severityColor } from '../../styles/tokens.js';

export function TopBar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indices = useIndices() as any;
  const global_instability = indices.global_instability as number | undefined;
  const isLoading = indices.isLoading as boolean;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const gii = Math.round(global_instability ?? 0);
  const giiColor = severityColor(gii);
  const threatLabel = gii >= 67 ? 'CRITICAL' : gii >= 34 ? 'ELEVATED' : 'NOMINAL';

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '16px',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Bottom accent line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, var(--color-cyan), transparent 30%, transparent 70%, var(--color-cyan))',
        opacity: 0.15,
      }} />

      {/* GII Threat Level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          THREAT LVL
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: `${giiColor}12`,
          border: `1px solid ${giiColor}33`,
          padding: '2px 8px',
          position: 'relative',
        }}>
          {/* Corner tick */}
          <div style={{
            position: 'absolute', top: -1, left: -1,
            width: 6, height: 6,
            borderTop: `1px solid ${giiColor}`,
            borderLeft: `1px solid ${giiColor}`,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: giiColor,
            textShadow: `0 0 12px ${giiColor}66`,
            minWidth: '24px',
            textAlign: 'center',
          }}>
            {isLoading ? '--' : gii}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.1em',
            color: giiColor,
            opacity: 0.8,
          }}>
            {threatLabel}
          </span>
        </div>
      </div>

      {/* Status indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
      }}>
        <span>◆ SIG:ACTIVE</span>
        <span>◆ NET:SECURE</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* UTC Clock — military format */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--color-cyan)',
        letterSpacing: '0.08em',
        textShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ZULU</span>
        {time.toISOString().replace('T', ' ').slice(0, 19)}Z
      </div>
    </header>
  );
}
