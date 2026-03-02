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
        background: 'var(--bg-surface)',
        border: `1px solid ${color}22`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '10px',
        padding: compact ? '8px 10px' : '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '5px' : '8px',
        position: 'relative',
      }}
    >

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          <Badge severity={alert.severity} label={String(alert.type ?? '').replace(/_/g, ' ')} />
          {isAcknowledged && (
            <span style={{ fontSize: '12px', color: 'var(--color-success)' }}>✓ Ack</span>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
          {triggeredAt}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {entities.slice(0, 6).map((entity, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                  }}
                >
                  {entity.name ?? String(entity)}
                </span>
              ))}
            </div>
          )}

          {/* Confidence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', minWidth: '64px' }}>Conf</span>
            <div style={{ flex: 1 }}>
              <ConfidenceBar value={Number(alert.confidence ?? 0.5)} height={2} />
            </div>
          </div>

          {/* Source count */}
          {(sources.length > 0 || signalIds.length > 0) && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {sources.length} src · {signalIds.length} sig
            </div>
          )}
        </>
      )}

      {/* Actions */}
      {(onAcknowledge || onDismiss) && !isAcknowledged && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                padding: '4px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                background: `${color}15`,
                border: `1px solid ${color}55`,
                borderRadius: '6px',
                color,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Acknowledge
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              style={{
                padding: '4px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
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
