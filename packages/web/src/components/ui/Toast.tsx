import React from 'react';
import { severityColor } from '../../styles/tokens.js';

interface ToastProps {
  id: string;
  title: string;
  body?: string;
  severity: number;
  type: string;
  onDismiss: (id: string) => void;
}

export function Toast({ id, title, body, severity, onDismiss }: ToastProps) {
  const color = severityColor(severity);

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--bg-raised)',
        border: `1px solid ${color}44`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        maxWidth: '340px',
        boxShadow: 'var(--shadow-elevated)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: body ? '4px' : 0 }}>
            {title}
          </div>
          {body && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {body.slice(0, 120)}{body.length > 120 ? '…' : ''}
            </div>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '16px',
            padding: '0',
            lineHeight: 1,
            marginTop: '-2px',
          }}
        >×</button>
      </div>
    </div>
  );
}
