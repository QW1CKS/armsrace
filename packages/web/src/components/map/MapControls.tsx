import React from 'react';

interface LayerOptions {
  id: string;
  label: string;
  enabled: boolean;
  onToggle: (id: string) => void;
}

interface MapControlsProps {
  layers: LayerOptions[];
}

export function MapControls({ layers }: MapControlsProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      right: '12px',
      zIndex: 1000,
      background: 'var(--bg-glass-heavy)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      minWidth: '130px',
    }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
        Layers
      </div>
      {layers.map((layer) => (
        <label
          key={layer.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '11px',
            color: layer.enabled ? 'var(--text-primary)' : 'var(--text-muted)',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={layer.enabled}
            onChange={() => layer.onToggle(layer.id)}
            style={{ accentColor: 'var(--color-info)', cursor: 'pointer' }}
          />
          {layer.label}
        </label>
      ))}
    </div>
  );
}
