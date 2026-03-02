import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { BarChart } from '../../components/charts/BarChart.js';
import { useSignals } from '../../hooks/useSignals.js';
import { severityColor } from '../../styles/tokens.js';

export default function Geopolitics() {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const conflictQuery = useSignals({ category: 'conflict', limit: 100 });
  const advisoryQuery = useSignals({ category: 'advisory', limit: 50 });

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

  function timeAgo(epochMs: number): string {
    const diff = Date.now() - epochMs;
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Geopolitics
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              style={{
                padding: '4px 12px',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${activeRegion === r ? 'var(--color-info)' : 'var(--border-subtle)'}`,
                background: activeRegion === r ? 'rgba(137,180,250,0.1)' : 'transparent',
                color: activeRegion === r ? 'var(--color-info)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
        {/* Conflict Feed */}
        <Card title={`Conflict Feed (${filtered.length})`}>
          {conflictQuery.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No conflict signals
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {filtered.slice(0, 40).map((s, i) => (
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
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {s.published_at ? timeAgo(Number(s.published_at)) : ''}
                      </span>
                    </div>
                  </div>
                  <Badge severity={s.severity} size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {barData.length > 0 && (
            <Card title="Severity by Country">
              <BarChart
                data={barData}
                series={[{ key: 'severity', label: 'Severity' }]}
                xKey="name"
                height={220}
                layout="vertical"
                showGrid={false}
                colorByValue={severityColor}
                yFormatter={(v) => String(v)}
              />
            </Card>
          )}

          <Card title="Travel Advisories">
            {advisorySignals.length === 0 ? (
              <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                No advisories
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
                {advisorySignals.slice(0, 20).map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: '28px' }}>
                      {s.country_code ?? '??'}
                    </span>
                    <span style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {s.title}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: severityColor(s.severity), fontWeight: 600, flexShrink: 0 }}>
                      L{Math.ceil((s.severity / 100) * 4)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
