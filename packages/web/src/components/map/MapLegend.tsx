import React from 'react';
import { colors } from '../../styles/tokens.js';

const LEGEND_ITEMS = [
  { label: 'Critical (67–100)', color: colors.danger },
  { label: 'Elevated (34–66)', color: colors.warning },
  { label: 'Nominal (0–33)', color: colors.success },
];

const HEATMAP_GRADIENT = [
  { stop: '0%', color: 'rgba(74, 222, 128, 0.6)' },
  { stop: '50%', color: 'rgba(251, 191, 36, 0.7)' },
  { stop: '100%', color: 'rgba(248, 113, 113, 0.9)' },
];

interface MapLegendProps {
  showHeatmap?: boolean;
}

export function MapLegend({ showHeatmap = false }: MapLegendProps) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '28px',
      left: '12px',
      zIndex: 1000,
      background: 'var(--bg-glass-heavy)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
        Severity
      </div>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: item.color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.label}</span>
        </div>
      ))}

      {showHeatmap && (
        <>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '6px', marginBottom: '2px' }}>
            Heat Density
          </div>
          <div style={{
            height: '6px',
            width: '110px',
            borderRadius: '3px',
            background: `linear-gradient(to right, ${HEATMAP_GRADIENT.map(g => `${g.color} ${g.stop}`).join(', ')})`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', width: '110px' }}>
            <span>Low</span>
            <span>High</span>
          </div>
        </>
      )}
    </div>
  );
}
