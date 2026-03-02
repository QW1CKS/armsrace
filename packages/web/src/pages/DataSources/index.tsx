import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { useQuery } from '@tanstack/react-query';
import { getSources } from '../../api/endpoints/sources.js';

const STATUS_COLOR: Record<string, string> = {
  ok: '#4ade80',
  error: '#f87171',
  rate_limited: '#fbbf24',
  disabled: 'var(--text-muted)',
  pending: '#38bdf8',
};

const STATUS_LABEL: Record<string, string> = {
  ok: 'Healthy',
  error: 'Error',
  rate_limited: 'Rate Limited',
  disabled: 'Disabled',
  pending: 'Pending',
};

const CATEGORY_LABELS: Record<string, string> = {
  hazard: 'Hazards',
  conflict: 'Geopolitics',
  cyber: 'Cyber',
  military: 'Military',
  market: 'Markets',
  infrastructure: 'Infrastructure',
  news: 'News',
  social: 'Social',
};

function timeAgo(epochMs: number | null): string {
  if (!epochMs) return '—';
  const diff = Date.now() - epochMs;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function DataSources() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: sourcesResponse, isLoading, refetch } = useQuery({
    queryKey: ['sources'],
    queryFn: getSources,
    refetchInterval: 30_000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sources: any[] = (sourcesResponse as any)?.data ?? [];

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)];
  const statuses = ['all', 'ok', 'error', 'rate_limited', 'disabled', 'pending'];

  const filtered = sources.filter((s) => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const statusCounts = sources.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  function FilterButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className={`chip-btn${active ? ' active' : ''}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Data Sources
        </h2>
        <button
          onClick={() => refetch()}
          className="chip-btn"
        >
          Refresh
        </button>
      </div>

      {/* Health summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
        {['ok', 'error', 'rate_limited', 'disabled', 'pending'].map((status) => (
          <Card key={status}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: STATUS_COLOR[status] ?? 'var(--text-muted)' }}>
                {statusCounts[status] ?? 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {STATUS_LABEL[status] ?? status}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}>Category:</span>
          {categories.map((c) => (
            <FilterButton key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
              {c === 'all' ? 'All' : (CATEGORY_LABELS[c] ?? c)}
            </FilterButton>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}>Status:</span>
          {statuses.map((s) => (
            <FilterButton key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : (STATUS_LABEL[s] ?? s)}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Source table */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No sources match filters
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Connector', 'Category', 'Status', 'Last Fetch', 'Signals', 'Error'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: 'var(--color-info)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((source, i) => (
                  <tr
                    key={source.source_id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '12px' }}>
                      {source.source_id}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {CATEGORY_LABELS[source.category] ?? (source.category ?? '—')}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: STATUS_COLOR[source.status] ?? 'var(--text-muted)',
                          flexShrink: 0,
                        }} />
                        <span style={{ color: STATUS_COLOR[source.status] ?? 'var(--text-muted)', fontSize: '12px' }}>
                          {STATUS_LABEL[source.status] ?? source.status}
                        </span>
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {timeAgo(source.last_fetch_at)}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'right' }}>
                      {(source.total_signals ?? 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-danger)', fontSize: '13px', maxWidth: '200px' }}>
                      {source.error_msg ? (
                        <span title={source.error_msg} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {source.error_msg}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
        All sources operate in read-only mode. Connectors marked "Disabled" require an API key in .env.
        See DATA_SOURCES.md for full attribution, license, and compliance information.
      </p>
    </div>
  );
}
