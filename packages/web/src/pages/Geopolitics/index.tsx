import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { BarChart } from '../../components/charts/BarChart.js';
import { AreaChart } from '../../components/charts/AreaChart.js';
import { useSignals } from '../../hooks/useSignals.js';
import { useIndices } from '../../hooks/useIndices.js';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
import { severityColor } from '../../styles/tokens.js';

function timeAgo(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function Geopolitics() {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'feed' | 'analysis'>('feed');
  const conflictQuery = useSignals({ category: 'conflict', limit: 200 });
  const advisoryQuery = useSignals({ category: 'advisory', limit: 50 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;
  const giiValue: number = indicesData.global_instability ?? 0;

  const regions = ['all', 'Europe', 'Middle East', 'Asia', 'Africa', 'Americas'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conflictSignals: any[] = (conflictQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const advisorySignals: any[] = (advisoryQuery.data as any)?.data ?? [];

  const filtered = conflictSignals.filter((s) => {
    if (activeRegion === 'all') return true;
    return s.region === activeRegion;
  });

  // Country severity bar chart data
  const countryMap: Record<string, number> = {};
  for (const s of filtered) {
    if (s.country_code) {
      countryMap[s.country_code] = Math.max(countryMap[s.country_code] ?? 0, s.severity);
    }
  }
  const barData = Object.entries(countryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([name, severity]) => ({ name, severity }));

  // Severity distribution
  const severityDist = useMemo(() => {
    const buckets = [
      { name: 'Low (0-33)', range: [0, 33], count: 0, color: '#4ade80' },
      { name: 'Medium (34-66)', range: [34, 66], count: 0, color: '#fbbf24' },
      { name: 'High (67-100)', range: [67, 100], count: 0, color: '#f87171' },
    ];
    for (const s of filtered) {
      for (const b of buckets) {
        if (s.severity >= b.range[0] && s.severity <= b.range[1]) {
          b.count++;
          break;
        }
      }
    }
    return buckets;
  }, [filtered]);

  // Timeline data — signals binned by hour
  const timelineData = useMemo(() => {
    const now = Date.now();
    const bins: Record<string, number> = {};
    for (let h = 23; h >= 0; h--) {
      const label = `${h}h`;
      bins[label] = 0;
    }
    for (const s of filtered) {
      const hoursAgo = Math.floor((now - Number(s.published_at)) / 3_600_000);
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const label = `${hoursAgo}h`;
        bins[label] = (bins[label] ?? 0) + 1;
      }
    }
    return Object.entries(bins).reverse().map(([time, count]) => ({ time, count }));
  }, [filtered]);

  // Top hotspots
  const hotspots = useMemo(() => {
    const map: Record<string, { count: number; maxSev: number; latest: string }> = {};
    for (const s of filtered) {
      const cc = s.country_code ?? 'UNK';
      if (!map[cc]) map[cc] = { count: 0, maxSev: 0, latest: '' };
      map[cc].count++;
      map[cc].maxSev = Math.max(map[cc].maxSev, s.severity);
      if (!map[cc].latest || Number(s.published_at) > Number(map[cc].latest)) {
        map[cc].latest = s.title;
      }
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b.maxSev - a.maxSev)
      .slice(0, 6)
      .map(([code, data]) => ({ code, ...data }));
  }, [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Geopolitics
        </h2>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`chip-btn${activeRegion === r ? ' active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <Card glow={giiValue >= 67 ? 'danger' : giiValue >= 34 ? 'warning' : undefined}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
            <RiskGauge value={giiValue} label="GLOBAL INSTABILITY" size={120} />
          </div>
        </Card>
        <Card>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="metric-label">SITUATION OVERVIEW</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div className="metric-value" style={{ color: 'var(--color-info)', fontSize: '28px' }}>{filtered.length}</div>
                <span className="metric-sublabel">Active Signals</span>
              </div>
              <div>
                <div className="metric-value" style={{ color: severityColor(70), fontSize: '28px' }}>
                  {filtered.filter((s) => s.severity >= 67).length}
                </div>
                <span className="metric-sublabel">Critical Events</span>
              </div>
              <div>
                <div className="metric-value" style={{ color: 'var(--color-warning)', fontSize: '28px' }}>
                  {Object.keys(countryMap).length}
                </div>
                <span className="metric-sublabel">Countries Affected</span>
              </div>
              <div>
                <div className="metric-value" style={{ color: 'var(--color-purple)', fontSize: '28px' }}>
                  {advisorySignals.length}
                </div>
                <span className="metric-sublabel">Travel Advisories</span>
              </div>
            </div>
          </div>
        </Card>
        <Card title="Severity Distribution">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
            {severityDist.map((b) => (
              <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', minWidth: '90px' }}>{b.name}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                  <div style={{
                    width: `${filtered.length > 0 ? (b.count / filtered.length) * 100 : 0}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: b.color,
                    boxShadow: `0 0 8px ${b.color}44`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: b.color, fontWeight: 700, minWidth: '24px', textAlign: 'right' }}>
                  {b.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Signal activity timeline */}
      {timelineData.length > 0 && (
        <Card title="Signal Activity (Last 24h)">
          <AreaChart
            data={timelineData}
            series={[{ key: 'count', label: 'Signals', color: '#38bdf8' }]}
            xKey="time"
            height={140}
            showGrid
          />
        </Card>
      )}

      {/* Active Hotspots */}
      {hotspots.length > 0 && (
        <Card title="Active Hotspots">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {hotspots.map((h) => {
              const color = severityColor(h.maxSev);
              return (
                <div key={h.code} style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${color}33`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color }}>
                      {h.code}
                    </span>
                    <Badge severity={h.maxSev} size="sm" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {h.count} signal{h.count !== 1 ? 's' : ''} · Max severity {h.maxSev}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.latest}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tabs: Feed / Analysis */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={() => setActiveTab('feed')} className={`chip-btn${activeTab === 'feed' ? ' active' : ''}`}>
          Conflict Feed
        </button>
        <button onClick={() => setActiveTab('analysis')} className={`chip-btn${activeTab === 'analysis' ? ' active' : ''}`}>
          Analysis
        </button>
      </div>

      {activeTab === 'feed' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
          {/* Conflict Feed */}
          <Card title={`Conflict Feed (${filtered.length})`}>
            {conflictQuery.isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.1em' }}>
                No conflict signals — worker is ingesting data
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '500px', overflowY: 'auto' }}>
                {filtered.slice(0, 50).map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      padding: '10px 12px',
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 3,
                      alignSelf: 'stretch',
                      borderRadius: '2px',
                      background: severityColor(s.severity),
                      flexShrink: 0,
                      minHeight: '28px',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '4px' }}>
                        {s.title}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {s.country_code && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.country_code}</span>
                        )}
                        {s.source_id && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-info)', opacity: 0.7 }}>{s.source_id}</span>
                        )}
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {s.published_at ? timeAgo(Number(s.published_at)) : ''}
                        </span>
                        {s.confidence != null && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            conf: {Math.round(s.confidence)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge severity={s.severity} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card title="Travel Advisories">
              {advisorySignals.length === 0 ? (
                <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.1em' }}>
                  No advisories
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
                  {advisorySignals.slice(0, 20).map((s) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', minWidth: '28px', letterSpacing: '0.06em' }}>
                        {s.country_code ?? '??'}
                      </span>
                      <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {s.title}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: severityColor(s.severity), fontWeight: 600, flexShrink: 0, textShadow: `0 0 4px ${severityColor(s.severity)}` }}>
                        L{Math.ceil((s.severity / 100) * 4)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* Analysis Tab */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {barData.length > 0 && (
            <Card title="Severity by Country">
              <BarChart
                data={barData}
                series={[{ key: 'severity', label: 'Severity' }]}
                xKey="name"
                height={260}
                layout="vertical"
                showGrid={false}
                colorByValue={severityColor}
                yFormatter={(v) => String(v)}
              />
            </Card>
          )}
          <Card title="Threat Category Breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
              {(() => {
                const cats: Record<string, number> = {};
                for (const s of filtered) {
                  const cat = s.sub_category ?? s.category ?? 'Unknown';
                  cats[cat] = (cats[cat] ?? 0) + 1;
                }
                const sorted = Object.entries(cats).sort(([, a], [, b]) => b - a).slice(0, 10);
                const max = sorted[0]?.[1] ?? 1;
                return sorted.map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', minWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat}
                    </span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                      <div style={{
                        width: `${(count / max) * 100}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: 'var(--color-info)',
                        boxShadow: '0 0 8px rgba(56,189,248,0.3)',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-info)', fontWeight: 600, minWidth: '24px', textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                ));
              })()}
              {filtered.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No data available
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
