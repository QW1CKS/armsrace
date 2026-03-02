import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
import { BarChart } from '../../components/charts/BarChart.js';
import { AreaChart } from '../../components/charts/AreaChart.js';
import { useMarkets } from '../../hooks/useMarkets.js';
import { useIndices } from '../../hooks/useIndices.js';
import { useSignals } from '../../hooks/useSignals.js';
import { severityColor } from '../../styles/tokens.js';

const ASSET_GROUPS = [
  { id: 'stocks', label: 'Equities', classes: ['equity', 'index'] },
  { id: 'fx', label: 'FX', classes: ['fx'] },
  { id: 'metals', label: 'Metals', classes: ['commodity', 'metal'] },
  { id: 'crypto', label: 'Crypto', classes: ['crypto'] },
  { id: 'energy', label: 'Energy', classes: ['energy'] },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PriceRow({ m }: { m: any }) {
  const change = Number(m.change_pct ?? m.change_24h ?? 0);
  const isUp = change >= 0;
  const color = isUp ? severityColor(20) : severityColor(75);
  const price = Number(m.price);
  return (
    <div className="list-row" style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-info)', minWidth: '68px', fontWeight: 500 }}>
        {m.symbol}
      </span>
      <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px' }}>
        {m.name ?? ''}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'right', minWidth: '80px' }}>
        {price.toLocaleString(undefined, { maximumFractionDigits: price >= 100 ? 2 : 4 })}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color, minWidth: '68px', textAlign: 'right', fontWeight: 600, textShadow: `0 0 6px ${color}44` }}>
        {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{change.toFixed(2)}%
      </span>
    </div>
  );
}

export default function Markets() {
  const [activeGroup, setActiveGroup] = useState('stocks');
  const marketsQuery = useMarkets();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;
  const marketNewsQuery = useSignals({ category: 'market', limit: 30 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMarkets: any[] = (marketsQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marketNews: any[] = (marketNewsQuery.data as any)?.data ?? [];
  const marketStressValue: number = indicesData.market_stress ?? 0;
  const fearGreedValue: number = indicesData.fear_greed ?? 0;

  const activeClasses = ASSET_GROUPS.find((g) => g.id === activeGroup)?.classes ?? [];
  const filtered = allMarkets.filter((m) => activeClasses.includes(m.asset_class));

  const fgLabel = fearGreedValue >= 75 ? 'EXTREME GREED' : fearGreedValue >= 55 ? 'GREED' : fearGreedValue >= 45 ? 'NEUTRAL' : fearGreedValue >= 25 ? 'FEAR' : 'EXTREME FEAR';
  const fgColor = fearGreedValue >= 55 ? severityColor(20) : fearGreedValue >= 45 ? severityColor(50) : severityColor(80);

  // Summary stats
  const stats = useMemo(() => {
    const up = filtered.filter((m) => Number(m.change_pct ?? m.change_24h ?? 0) >= 0).length;
    const down = filtered.length - up;
    const topGainer = [...filtered].sort((a, b) => Number(b.change_pct ?? b.change_24h ?? 0) - Number(a.change_pct ?? a.change_24h ?? 0))[0];
    const topLoser = [...filtered].sort((a, b) => Number(a.change_pct ?? a.change_24h ?? 0) - Number(b.change_pct ?? b.change_24h ?? 0))[0];
    return { up, down, topGainer, topLoser };
  }, [filtered]);

  // Performance chart data (bar chart of changes)
  const perfData = useMemo(() => {
    return [...filtered]
      .sort((a, b) => Math.abs(Number(b.change_pct ?? b.change_24h ?? 0)) - Math.abs(Number(a.change_pct ?? a.change_24h ?? 0)))
      .slice(0, 15)
      .map((m) => ({
        name: m.symbol,
        change: Number(Number(m.change_pct ?? m.change_24h ?? 0).toFixed(2)),
      }));
  }, [filtered]);

  // Asset class distribution
  const classDist = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of allMarkets) {
      map[m.asset_class] = (map[m.asset_class] ?? 0) + 1;
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [allMarkets]);

  function timeAgo(epochMs: number): string {
    const diff = Date.now() - epochMs;
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  }

  return (
    <div className="page-stack">
      <div className="section-header">
        <h2 className="section-title">Markets</h2>
        <div className="chip-row">
          {ASSET_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`chip-btn${activeGroup === g.id ? ' active' : ''}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <Card glow={marketStressValue >= 67 ? 'danger' : marketStressValue >= 34 ? 'warning' : undefined}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
            <RiskGauge value={marketStressValue} label="MKT STRESS" size={110} />
          </div>
        </Card>

        <Card title="Fear & Greed">
          {fearGreedValue === 0 ? (
            <div style={{ padding: '12px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '13px' }}>LOADING…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', padding: '8px 0' }}>
              <span className="metric-value" style={{ color: fgColor, fontSize: '40px' }}>{Math.round(fearGreedValue)}</span>
              <span className="metric-label" style={{ color: fgColor }}>{fgLabel}</span>
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #f87171, #fbbf24, #4ade80)', opacity: 0.3, marginTop: '4px' }} />
            </div>
          )}
        </Card>

        <Card title="Market Pulse">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '4px 0' }}>
            <div>
              <div className="metric-value" style={{ color: severityColor(20), fontSize: '26px' }}>{stats.up}</div>
              <span className="metric-sublabel">Gainers</span>
            </div>
            <div>
              <div className="metric-value" style={{ color: severityColor(75), fontSize: '26px' }}>{stats.down}</div>
              <span className="metric-sublabel">Losers</span>
            </div>
            {stats.topGainer && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="metric-label">TOP MOVER</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-info)' }}>{stats.topGainer.symbol}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: severityColor(20), fontWeight: 600 }}>
                    +{Number(stats.topGainer.change_pct ?? stats.topGainer.change_24h ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Asset Coverage">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 0' }}>
            {classDist.map((c) => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{c.count}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span className="metric-label">TOTAL</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-info)', fontWeight: 700 }}>{allMarkets.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance chart */}
      {perfData.length > 0 && (
        <Card title={`${ASSET_GROUPS.find((g) => g.id === activeGroup)?.label ?? ''} — Performance`}>
          <BarChart
            data={perfData}
            series={[{ key: 'change', label: '% Change', color: '#38bdf8' }]}
            xKey="name"
            height={180}
            showGrid
            colorByValue={(v) => v >= 0 ? '#4ade80' : '#f87171'}
            yFormatter={(v) => `${v}%`}
          />
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '14px' }}>
        {/* Price table */}
        <Card title={ASSET_GROUPS.find((g) => g.id === activeGroup)?.label ?? ''}>
          {marketsQuery.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '0.08em' }}>
              No data — worker initializing
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {/* Table header */}
              <div style={{ display: 'flex', padding: '4px 0', borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, background: 'rgba(10, 14, 23, 0.95)', zIndex: 1 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', minWidth: '68px' }}>SYMBOL</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '0 8px' }}>NAME</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', minWidth: '80px', textAlign: 'right' }}>PRICE</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', minWidth: '68px', textAlign: 'right' }}>CHANGE</span>
              </div>
              {filtered.map((m) => <PriceRow key={m.symbol} m={m} />)}
            </div>
          )}
        </Card>

        {/* Market News & Signals sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card title="Market Signals">
            {marketNewsQuery.isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner size={20} /></div>
            ) : marketNews.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                No market signals yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: '350px', overflowY: 'auto' }}>
                {marketNews.slice(0, 15).map((s, i) => (
                  <div key={s.id} style={{
                    padding: '8px 0',
                    borderBottom: i < marketNews.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 3, alignSelf: 'stretch', borderRadius: 2,
                      background: severityColor(s.severity), flexShrink: 0, minHeight: '20px',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '2px' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {s.source_id && <span style={{ color: 'var(--color-info)', opacity: 0.7 }}>{s.source_id} · </span>}
                        {s.published_at ? timeAgo(Number(s.published_at)) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="All Symbols">
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {allMarkets.slice(0, 30).map((m) => {
                const chg = Number(m.change_pct ?? m.change_24h ?? 0);
                return (
                  <div key={m.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{m.symbol}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '12px',
                      color: chg >= 0 ? severityColor(20) : severityColor(75),
                      fontWeight: 600,
                    }}>
                      {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
