import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { AlertFeed } from '../../components/alerts/AlertFeed.js';
import { useAlerts } from '../../hooks/useAlerts.js';
import { useAlertContext } from '../../context/AlertContext.js';
import { useQueryClient } from '@tanstack/react-query';
import { acknowledgeAlert, dismissAlert } from '../../api/endpoints/alerts.js';

const SEVERITY_FILTERS = [
  { label: 'All', min: 0 },
  { label: 'Critical', min: 67 },
  { label: 'Elevated', min: 34 },
];

const TYPE_FILTERS = ['all', 'geopolitical_escalation', 'military_posture', 'market_shock', 'cyber_spike', 'infra_disruption', 'convergence'];
const STATUS_FILTERS = ['all', 'unread', 'acknowledged'];

const PAGE_SIZE = 20;

export default function Alerts() {
  const [severityMin, setSeverityMin] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  const queryClient = useQueryClient();

  const queryParams: Record<string, string | number> = {
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };
  if (severityMin > 0) queryParams.severity_min = severityMin;
  if (typeFilter !== 'all') queryParams.type = typeFilter;
  if (statusFilter === 'acknowledged') queryParams.acknowledged = 'true';
  if (statusFilter === 'unread') queryParams.acknowledged = 'false';

  const { data: alertsResponse, isLoading } = useAlerts(queryParams);
  const { unreadCount } = useAlertContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alerts: any[] = (alertsResponse as any)?.data ?? [];

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const handleDismiss = async (id: string) => {
    await dismissAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  function FilterButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: '3px 10px',
          fontSize: 'var(--text-xs)',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${active ? 'var(--color-info)' : 'var(--border-subtle)'}`,
          background: active ? 'rgba(137,180,250,0.1)' : 'transparent',
          color: active ? 'var(--color-info)' : 'var(--text-muted)',
          cursor: 'pointer',
          textTransform: 'capitalize',
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Alert Center{unreadCount > 0 && (
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--color-warning)', marginLeft: '8px' }}>
              {unreadCount} unread
            </span>
          )}
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginRight: '4px' }}>Severity:</span>
            {SEVERITY_FILTERS.map((f) => (
              <FilterButton key={f.label} active={severityMin === f.min} onClick={() => setSeverityMin(f.min)}>
                {f.label}
              </FilterButton>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginRight: '4px' }}>Status:</span>
            {STATUS_FILTERS.map((f) => (
              <FilterButton key={f} active={statusFilter === f} onClick={() => setStatusFilter(f)}>
                {f}
              </FilterButton>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginRight: '4px' }}>Type:</span>
            {TYPE_FILTERS.map((f) => (
              <FilterButton key={f} active={typeFilter === f} onClick={() => setTypeFilter(f)}>
                {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
              </FilterButton>
            ))}
          </div>
        </div>
      </Card>

      {/* Feed */}
      <AlertFeed
        alerts={alerts}
        loading={isLoading}
        onAcknowledge={handleAcknowledge}
        onDismiss={handleDismiss}
      />

      {/* Pagination */}
      {(alerts.length === PAGE_SIZE || page > 0) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: '6px 16px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: page === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: page === 0 ? 'default' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', alignSelf: 'center' }}>
            Page {page + 1}
          </span>
          <button
            disabled={alerts.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: '6px 16px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: alerts.length < PAGE_SIZE ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: alerts.length < PAGE_SIZE ? 'default' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
