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
      background: 'rgba(17, 17, 27, 0.92)',
      border: '1px solid rgba(108, 112, 134, 0.3)',
      borderRadius: '8px',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      backdropFilter: 'blur(4px)',
      minWidth: '140px',
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6c7086', marginBottom: '2px' }}>
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
            fontSize: '12px',
            color: layer.enabled ? '#cdd6f4' : '#6c7086',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={layer.enabled}
            onChange={() => layer.onToggle(layer.id)}
            style={{ accentColor: '#89b4fa', cursor: 'pointer' }}
          />
          {layer.label}
        </label>
      ))}
    </div>
  );
}
