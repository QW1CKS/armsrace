import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card.js';
import { ConfidenceBar } from '../../components/ui/ConfidenceBar.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { BarChart } from '../../components/charts/BarChart.js';
import { useQuery } from '@tanstack/react-query';
import { getPredictions } from '../../api/endpoints/predictions.js';
import { severityColor } from '../../styles/tokens.js';
import { APP_DISCLAIMER, FORECAST_DISCLAIMER } from '@armsrace/shared';

const HORIZONS = [
  { id: '24h', label: '24 Hours', icon: '⚡' },
  { id: '72h', label: '72 Hours', icon: '◎' },
  { id: '7d', label: '7 Days', icon: '◈' },
];

const CATEGORY_COLORS: Record<string, string> = {
  country: '#38bdf8',
  region: '#22d3ee',
  market: '#fbbf24',
  sector: '#a78bfa',
  asset: '#4ade80',
  commodity: '#f87171',
};

function timeAgo(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function Predictions() {
  const [activeHorizon, setActiveHorizon] = useState('24h');
  const { data: forecastsResponse, isLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => getPredictions({}),
    refetchInterval: 5 * 60 * 1000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawForecasts: any[] = (forecastsResponse as any)?.data ?? [];

  const grouped: Record<string, typeof rawForecasts> = {};
  for (const f of rawForecasts) {
    if (!grouped[f.horizon]) grouped[f.horizon] = [];
    grouped[f.horizon]!.push(f);
  }

  const activeForecasts = grouped[activeHorizon] ?? [];

  // Summary stats
  const stats = useMemo(() => {
    const total = rawForecasts.length;
    const highProb = rawForecasts.filter((f) => Number(f.probability) >= 0.7).length;
    const avgProb = total > 0 ? rawForecasts.reduce((s, f) => s + Number(f.probability ?? 0), 0) / total : 0;
    const byHorizon = Object.entries(grouped).map(([h, items]) => ({ horizon: h, count: items.length }));
    return { total, highProb, avgProb, byHorizon };
  }, [rawForecasts, grouped]);

  // Category distribution for bar chart
  const categoryDist = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of activeForecasts) {
      const cat = f.subject_type ?? 'unknown';
      map[cat] = (map[cat] ?? 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [activeForecasts]);

  // Sort forecasts by probability descending
  const sortedForecasts = useMemo(
    () => [...activeForecasts].sort((a, b) => Number(b.probability ?? 0) - Number(a.probability ?? 0)),
    [activeForecasts],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Forecast Engine
        </h2>
        <div style={{ display: 'flex', gap: '4px' }}>
          {HORIZONS.map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveHorizon(h.id)}
              className={`chip-btn${activeHorizon === h.id ? ' active' : ''}`}
            >
              {h.icon} {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(251,191,36,0.04)',
        border: '1px solid rgba(251,191,36,0.12)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 14px',
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>⚠ </span>
        {APP_DISCLAIMER}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Spinner />
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
                <span className="metric-value" style={{ color: 'var(--color-info)', fontSize: '34px' }}>{stats.total}</span>
                <span className="metric-label">Total Forecasts</span>
              </div>
            </Card>
            <Card glow={stats.highProb > 3 ? 'warning' : undefined}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
                <span className="metric-value" style={{ color: '#fbbf24', fontSize: '34px' }}>{stats.highProb}</span>
                <span className="metric-label">High Probability (≥70%)</span>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
                <span className="metric-value" style={{ color: severityColor(Math.round(stats.avgProb * 100)), fontSize: '34px' }}>
                  {Math.round(stats.avgProb * 100)}%
                </span>
                <span className="metric-label">Avg Probability</span>
              </div>
            </Card>
            <Card title="By Horizon">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {stats.byHorizon.map((h) => (
                  <div key={h.horizon} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: activeHorizon === h.horizon ? 'var(--color-info)' : 'var(--text-muted)' }}>
                      {h.horizon}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {h.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Category distribution */}
          {categoryDist.length > 0 && (
            <Card title={`Category Distribution — ${activeHorizon}`}>
              <BarChart
                data={categoryDist}
                series={[{ key: 'count', label: 'Forecasts', color: '#38bdf8' }]}
                xKey="name"
                height={120}
                showGrid={false}
              />
            </Card>
          )}

          {/* Forecast cards */}
          {sortedForecasts.length === 0 ? (
            <Card>
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                No forecasts for {HORIZONS.find((h) => h.id === activeHorizon)?.label ?? activeHorizon} — forecasts are computed every 30 minutes
              </div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
              {sortedForecasts.map((f) => {
                const prob = Number(f.probability ?? 0);
                const genAt = Number(f.generated_at ?? 0);
                const catColor = CATEGORY_COLORS[f.subject_type] ?? 'var(--color-info)';
                return (
                  <Card key={f.id} glow={prob >= 0.7 ? 'warning' : undefined}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {f.subject ?? f.title ?? 'Scenario'}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: '11px', color: catColor, fontWeight: 600,
                              padding: '2px 8px', borderRadius: '4px', background: `${catColor}15`,
                              border: `1px solid ${catColor}30`, letterSpacing: '0.06em',
                            }}>
                              {f.subject_type?.toUpperCase() ?? 'N/A'}
                            </span>
                            {genAt > 0 && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {timeAgo(genAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                            color: severityColor(Math.round(prob * 100)),
                            textShadow: `0 0 12px ${severityColor(Math.round(prob * 100))}66`,
                          }}>
                            {Math.round(prob * 100)}%
                          </span>
                        </div>
                      </div>

                      <ConfidenceBar value={prob} height={5} />

                      {f.narrative && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: '60px', overflow: 'hidden' }}>
                          {f.narrative}
                        </div>
                      )}

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4, borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                        {FORECAST_DISCLAIMER}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
