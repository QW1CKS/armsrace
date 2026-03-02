import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
import { useMarkets } from '../../hooks/useMarkets.js';
import { useIndices } from '../../hooks/useIndices.js';
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
  return (
    <div className="list-row">
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-info)', minWidth: '68px' }}>
        {m.symbol}
      </span>
      <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', textAlign: 'right' }}>
        {Number(m.price).toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color, minWidth: '60px', textAlign: 'right', fontWeight: 600, textShadow: `0 0 6px ${color}44` }}>
        {isUp ? '+' : ''}{change.toFixed(2)}%
      </span>
    </div>
  );
}

export default function Markets() {
  const [activeGroup, setActiveGroup] = useState('stocks');
  const marketsQuery = useMarkets();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMarkets: any[] = (marketsQuery.data as any)?.data ?? [];
  const marketStressValue: number = indicesData.market_stress ?? 0;
  const fearGreedValue: number = indicesData.fear_greed ?? 0;

  const activeClasses = ASSET_GROUPS.find((g) => g.id === activeGroup)?.classes ?? [];
  const filtered = allMarkets.filter((m) => activeClasses.includes(m.asset_class));

  const fgLabel = fearGreedValue >= 75 ? 'EXTREME GREED' : fearGreedValue >= 55 ? 'GREED' : fearGreedValue >= 45 ? 'NEUTRAL' : fearGreedValue >= 25 ? 'FEAR' : 'EXTREME FEAR';
  const fgColor = fearGreedValue >= 55 ? severityColor(20) : fearGreedValue >= 45 ? severityColor(50) : severityColor(80);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '14px' }}>
        {/* Price table */}
        <Card title={ASSET_GROUPS.find((g) => g.id === activeGroup)?.label ?? ''}>
          {marketsQuery.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>
              No data — worker initializing
            </div>
          ) : (
            <div>
              {filtered.map((m) => <PriceRow key={m.symbol} m={m} />)}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Card glow={marketStressValue >= 67 ? 'danger' : marketStressValue >= 34 ? 'warning' : undefined}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
              <RiskGauge value={marketStressValue} label="MKT STRESS" size={100} />
            </div>
          </Card>

          <Card title="Fear & Greed">
            {fearGreedValue === 0 ? (
              <div style={{ padding: '12px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '10px' }}>LOADING…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 700, color: fgColor, textShadow: `0 0 16px ${fgColor}44` }}>{Math.round(fearGreedValue)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: fgColor, fontWeight: 600, letterSpacing: '0.1em' }}>{fgLabel}</span>
              </div>
            )}
          </Card>

          <Card title="All Symbols">
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {allMarkets.slice(0, 30).map((m) => {
                const chg = Number(m.change_pct ?? m.change_24h ?? 0);
                return (
                  <div key={m.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{m.symbol}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
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
