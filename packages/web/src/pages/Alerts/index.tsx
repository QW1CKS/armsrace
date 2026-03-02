import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card.js';
import { AlertFeed } from '../../components/alerts/AlertFeed.js';
import { BarChart } from '../../components/charts/BarChart.js';
import { AreaChart } from '../../components/charts/AreaChart.js';
import { useAlerts } from '../../hooks/useAlerts.js';
import { useAlertContext } from '../../context/AlertContext.js';
import { useQueryClient } from '@tanstack/react-query';
import { acknowledgeAlert, dismissAlert } from '../../api/endpoints/alerts.js';
import { severityColor } from '../../styles/tokens.js';

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

  // Also fetch all recent alerts for analytics
  const { data: alertsResponse, isLoading } = useAlerts(queryParams);
  const allAlertsQuery = useAlerts({ limit: 100 });
  const { unreadCount } = useAlertContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alerts: any[] = (alertsResponse as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAlerts: any[] = (allAlertsQuery.data as any)?.data ?? [];

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const handleDismiss = async (id: string) => {
    await dismissAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  // Severity distribution
  const severityDist = useMemo(() => {
    const buckets = [
      { name: 'Critical (67-100)', count: 0, color: '#f87171' },
      { name: 'Elevated (34-66)', count: 0, color: '#fbbf24' },
      { name: 'Low (0-33)', count: 0, color: '#4ade80' },
    ];
    for (const a of allAlerts) {
      const sev = Number(a.severity ?? 0);
      if (sev >= 67) buckets[0].count++;
      else if (sev >= 34) buckets[1].count++;
      else buckets[2].count++;
    }
    return buckets;
  }, [allAlerts]);

  // Type distribution for bar chart
  const typeDist = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of allAlerts) {
      const type = a.type ?? 'unknown';
      map[type] = (map[type] ?? 0) + 1;
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }));
  }, [allAlerts]);

  // Timeline — alerts by hour (last 24h)
  const timelineData = useMemo(() => {
    const now = Date.now();
    const bins: Record<string, { time: string; critical: number; elevated: number; low: number }> = {};
    for (let h = 23; h >= 0; h--) {
      bins[`${h}h`] = { time: `${h}h`, critical: 0, elevated: 0, low: 0 };
    }
    for (const a of allAlerts) {
      const created = Number(a.created_at ?? a.generated_at ?? 0);
      const hoursAgo = Math.floor((now - created) / 3_600_000);
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const bin = bins[`${hoursAgo}h`];
        if (bin) {
          const sev = Number(a.severity ?? 0);
          if (sev >= 67) bin.critical++;
          else if (sev >= 34) bin.elevated++;
          else bin.low++;
        }
      }
    }
    return Object.values(bins).reverse();
  }, [allAlerts]);

  // Source analysis
  const sourceDist = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of allAlerts) {
      if (a.sources) {
        const sources = Array.isArray(a.sources) ? a.sources : [];
        for (const src of sources) {
          const name = typeof src === 'string' ? src : src?.source_id ?? src?.name ?? 'unknown';
          map[name] = (map[name] ?? 0) + 1;
        }
      }
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [allAlerts]);

  // Stats
  const criticalCount = allAlerts.filter((a) => Number(a.severity ?? 0) >= 67).length;
  const avgSeverity = allAlerts.length > 0
    ? Math.round(allAlerts.reduce((s, a) => s + Number(a.severity ?? 0), 0) / allAlerts.length)
    : 0;
  const avgConfidence = allAlerts.length > 0
    ? Math.round(allAlerts.reduce((s, a) => s + Number(a.confidence ?? 0), 0) / allAlerts.length)
    : 0;

  function FilterButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
      <button onClick={onClick} className={`chip-btn${active ? ' active' : ''}`}>
        {children}
      </button>
    );
  }

  return (
    <div className="page-stack">
      <div className="section-header">
        <h2 className="section-title">
          Alert Center{unreadCount > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 400, color: 'var(--color-danger)', marginLeft: '10px' }}>
              ({unreadCount} unread)
            </span>
          )}
        </h2>
      </div>

      {/* Analytics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            <span className="metric-value" style={{ color: 'var(--color-info)', fontSize: '34px' }}>{allAlerts.length}</span>
            <span className="metric-label">Total Alerts</span>
          </div>
        </Card>
        <Card glow={criticalCount > 5 ? 'danger' : undefined}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            <span className="metric-value" style={{ color: '#f87171', fontSize: '34px' }}>{criticalCount}</span>
            <span className="metric-label">Critical</span>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            <span className="metric-value" style={{ color: severityColor(avgSeverity), fontSize: '34px' }}>{avgSeverity}</span>
            <span className="metric-label">Avg Severity</span>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            <span className="metric-value" style={{ color: 'var(--color-info)', fontSize: '34px' }}>{avgConfidence}%</span>
            <span className="metric-label">Avg Confidence</span>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            <span className="metric-value" style={{ color: 'var(--color-danger)', fontSize: '34px', filter: 'drop-shadow(0 0 6px var(--color-danger))' }}>
              {unreadCount}
            </span>
            <span className="metric-label">Unread</span>
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Timeline */}
        {timelineData.some((d) => d.critical + d.elevated + d.low > 0) && (
          <Card title="Alert Timeline (24h)">
            <AreaChart
              data={timelineData}
              series={[
                { key: 'critical', label: 'Critical', color: '#f87171' },
                { key: 'elevated', label: 'Elevated', color: '#fbbf24' },
                { key: 'low', label: 'Low', color: '#4ade80' },
              ]}
              xKey="time"
              height={160}
              showGrid
              showLegend
              stacked
            />
          </Card>
        )}

        {/* Type distribution */}
        {typeDist.length > 0 && (
          <Card title="Alert Types">
            <BarChart
              data={typeDist}
              series={[{ key: 'count', label: 'Count', color: '#38bdf8' }]}
              xKey="name"
              height={160}
              showGrid={false}
              layout="vertical"
            />
          </Card>
        )}
      </div>

      {/* Severity + Source analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Card title="Severity Breakdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
            {severityDist.map((b) => {
              const pct = allAlerts.length > 0 ? (b.count / allAlerts.length) * 100 : 0;
              return (
                <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0, boxShadow: `0 0 6px ${b.color}` }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', minWidth: '110px' }}>{b.name}</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: b.color, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: b.color, fontWeight: 700, minWidth: '28px', textAlign: 'right' }}>
                    {b.count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {sourceDist.length > 0 && (
          <Card title="Top Sources">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 0' }}>
              {sourceDist.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-info)', minWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
                    <div style={{
                      width: `${(s.count / (sourceDist[0]?.count ?? 1)) * 100}%`,
                      height: '100%',
                      borderRadius: 2,
                      background: 'var(--color-info)',
                      opacity: 0.6,
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, minWidth: '20px', textAlign: 'right' }}>
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>Severity:</span>
            {SEVERITY_FILTERS.map((f) => (
              <FilterButton key={f.label} active={severityMin === f.min} onClick={() => { setSeverityMin(f.min); setPage(0); }}>
                {f.label}
              </FilterButton>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>Status:</span>
            {STATUS_FILTERS.map((f) => (
              <FilterButton key={f} active={statusFilter === f} onClick={() => { setStatusFilter(f); setPage(0); }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </FilterButton>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>Type:</span>
            {TYPE_FILTERS.map((f) => (
              <FilterButton key={f} active={typeFilter === f} onClick={() => { setTypeFilter(f); setPage(0); }}>
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
        <div className="pager">
          <button
            className="pager-btn"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ◂ Prev
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>
            Page {page + 1}
          </span>
          <button
            className="pager-btn"
            disabled={alerts.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ▸
          </button>
        </div>
      )}
    </div>
  );
}
