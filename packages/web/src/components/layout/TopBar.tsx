import React, { useEffect, useState } from 'react';
import { useIndices } from '../../hooks/useIndices.js';
import { severityColor } from '../../styles/tokens.js';

export function TopBar() {
  const { global_instability, isLoading } = useIndices();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const gii = Math.round(global_instability ?? 0);
  const giiColor = severityColor(gii);

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '16px',
      flexShrink: 0,
    }}>
      {/* GII Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Global Risk
        </span>
        <div style={{
          background: `${giiColor}22`,
          border: `1px solid ${giiColor}44`,
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: giiColor,
          fontFamily: 'var(--font-mono)',
          minWidth: '46px',
          textAlign: 'center',
        }}>
          {isLoading ? '--' : gii}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* UTC Clock */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }}>
        {time.toUTCString().replace(' GMT', ' UTC').split(' ').slice(1).join(' ')}
      </div>
    </header>
  );
}
