import React from 'react';
import { AlertCard } from './AlertCard.js';
import { Spinner } from '../ui/Spinner.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawAlert = Record<string, any>;

interface AlertFeedProps {
  alerts: RawAlert[];
  loading?: boolean;
  compact?: boolean;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  maxItems?: number;
}

export function AlertFeed({
  alerts,
  loading = false,
  compact = false,
  onAcknowledge,
  onDismiss,
  maxItems,
}: AlertFeedProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
        <Spinner />
      </div>
    );
  }

  const displayed = maxItems ? alerts.slice(0, maxItems) : alerts;

  if (displayed.length === 0) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
      }}>
        No alerts
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {displayed.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          compact={compact}
          onAcknowledge={onAcknowledge}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
