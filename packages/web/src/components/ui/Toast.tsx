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
  const typeLabel = severity >= 67 ? 'Critical' : severity >= 34 ? 'Warning' : 'Info';

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--bg-glass-heavy)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        maxWidth: '340px',
        boxShadow: 'var(--shadow-float)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color, letterSpacing: '0.04em', marginBottom: '3px', fontWeight: 600 }}>
            {typeLabel}
          </div>
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
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '12px',
            padding: '0 4px',
            lineHeight: 1.2,
          }}
        >×</button>
      </div>
    </div>
  );
}
