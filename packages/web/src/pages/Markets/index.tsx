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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', minWidth: '72px' }}>
        {m.symbol}
      </span>
      <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', textAlign: 'right' }}>
        {Number(m.price).toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)', color, minWidth: '64px', textAlign: 'right', fontWeight: 600 }}>
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

  const fgLabel = fearGreedValue >= 75 ? 'Extreme Greed' : fearGreedValue >= 55 ? 'Greed' : fearGreedValue >= 45 ? 'Neutral' : fearGreedValue >= 25 ? 'Fear' : 'Extreme Fear';
  const fgColor = fearGreedValue >= 55 ? severityColor(20) : fearGreedValue >= 45 ? severityColor(50) : severityColor(80);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Markets
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {ASSET_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              style={{
                padding: '4px 12px',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${activeGroup === g.id ? 'var(--color-info)' : 'var(--border-subtle)'}`,
                background: activeGroup === g.id ? 'rgba(137,180,250,0.1)' : 'transparent',
                color: activeGroup === g.id ? 'var(--color-info)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
        {/* Price table */}
        <Card title={ASSET_GROUPS.find((g) => g.id === activeGroup)?.label ?? ''}>
          {marketsQuery.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No market data — worker may be starting up
            </div>
          ) : (
            <div>
              {filtered.map((m) => <PriceRow key={m.symbol} m={m} />)}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card glow={marketStressValue >= 67 ? 'danger' : marketStressValue >= 34 ? 'warning' : undefined}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
              <RiskGauge value={marketStressValue} label="Market Stress" size={110} />
            </div>
          </Card>

          <Card title="Fear & Greed">
            {fearGreedValue === 0 ? (
              <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: fgColor }}>{Math.round(fearGreedValue)}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: fgColor, fontWeight: 600 }}>{fgLabel}</span>
              </div>
            )}
          </Card>

          <Card title="All Symbols">
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {allMarkets.slice(0, 30).map((m) => {
                const chg = Number(m.change_pct ?? m.change_24h ?? 0);
                return (
                  <div key={m.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{m.symbol}</span>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'monospace',
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
