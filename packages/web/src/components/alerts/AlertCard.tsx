import React from 'react';
import { severityColor } from '../../styles/tokens.js';
import { ConfidenceBar } from '../ui/ConfidenceBar.js';
import { Badge } from '../ui/Badge.js';
import { relativeTime } from '@armsrace/shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawAlert = Record<string, any>;

interface AlertCardProps {
  alert: RawAlert;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

export function AlertCard({ alert, onAcknowledge, onDismiss, compact = false }: AlertCardProps) {
  const color = severityColor(alert.severity);
  const triggeredAt = alert.triggered_at
    ? relativeTime(new Date(Number(alert.triggered_at)))
    : '';
  const isAcknowledged = !!alert.acknowledged_at;
  const entities: Array<{ name: string }> = Array.isArray(alert.entities) ? alert.entities : [];
  const sources: Array<{ name: string; url?: string }> = Array.isArray(alert.sources) ? alert.sources : [];
  const signalIds: string[] = Array.isArray(alert.signalIds) ? alert.signalIds : [];

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--bg-raised)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        padding: compact ? '10px 12px' : '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '6px' : '10px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <Badge severity={alert.severity} label={String(alert.type ?? '').replace(/_/g, ' ')} />
          {isAcknowledged && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>✓ ACK</span>
          )}
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {triggeredAt}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {alert.title}
      </div>

      {!compact && (
        <>
          {/* Body */}
          {alert.body && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {alert.body}
            </div>
          )}

          {/* Entities */}
          {entities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {entities.slice(0, 6).map((entity, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 6px',
                  }}
                >
                  {entity.name ?? String(entity)}
                </span>
              ))}
            </div>
          )}

          {/* Confidence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: '64px' }}>Confidence</span>
            <div style={{ flex: 1 }}>
              <ConfidenceBar value={Number(alert.confidence ?? 0.5)} height={3} />
            </div>
          </div>

          {/* Source count */}
          {(sources.length > 0 || signalIds.length > 0) && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {sources.length} source{sources.length !== 1 ? 's' : ''} · {signalIds.length} signal{signalIds.length !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      {(onAcknowledge || onDismiss) && !isAcknowledged && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                padding: '4px 10px',
                fontSize: 'var(--text-xs)',
                background: `${color}22`,
                border: `1px solid ${color}66`,
                borderRadius: 'var(--radius-sm)',
                color,
                cursor: 'pointer',
              }}
            >
              Acknowledge
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              style={{
                padding: '4px 10px',
                fontSize: 'var(--text-xs)',
                background: 'none',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
