import React from 'react';
import { colors } from '../../styles/tokens.js';

const LEGEND_ITEMS = [
  { label: 'Critical (67–100)', color: colors.danger },
  { label: 'Elevated (34–66)', color: colors.warning },
  { label: 'Low (0–33)', color: colors.success },
];

const HEATMAP_GRADIENT = [
  { stop: '0%', color: 'rgba(73, 209, 125, 0.6)' },
  { stop: '50%', color: 'rgba(245, 184, 75, 0.7)' },
  { stop: '100%', color: 'rgba(255, 93, 93, 0.9)' },
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
      background: 'rgba(17, 17, 27, 0.92)',
      border: '1px solid rgba(108, 112, 134, 0.3)',
      borderRadius: '8px',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6c7086', marginBottom: '2px' }}>
        Severity
      </div>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: item.color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '11px', color: '#a6adc8' }}>{item.label}</span>
        </div>
      ))}

      {showHeatmap && (
        <>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6c7086', marginTop: '6px', marginBottom: '2px' }}>
            Heat Density
          </div>
          <div style={{
            height: '8px',
            width: '120px',
            borderRadius: '4px',
            background: `linear-gradient(to right, ${HEATMAP_GRADIENT.map(g => `${g.color} ${g.stop}`).join(', ')})`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6c7086', width: '120px' }}>
            <span>Low</span>
            <span>High</span>
          </div>
        </>
      )}
    </div>
  );
}
