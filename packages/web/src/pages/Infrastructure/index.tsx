import React, { useMemo } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
import { BarChart } from '../../components/charts/BarChart.js';
import { AreaChart } from '../../components/charts/AreaChart.js';
import { useSignals } from '../../hooks/useSignals.js';
import { useIndices } from '../../hooks/useIndices.js';
import { severityColor } from '../../styles/tokens.js';

function timeAgo(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SignalList({ signals, loading, max = 20 }: { signals: any[]; loading: boolean; max?: number }) {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner size={20} /></div>;
  if (!signals.length) return <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>No signals detected</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '360px', overflowY: 'auto' }}>
      {signals.slice(0, max).map((s, i) => (
        <div key={s.id} style={{
          display: 'flex',
          gap: '10px',
          padding: '8px 0',
          borderBottom: i < signals.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: 3,
            alignSelf: 'stretch',
            borderRadius: 2,
            background: severityColor(s.severity),
            flexShrink: 0,
            minHeight: '20px',
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '2px' }}>
              {s.title}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {s.published_at ? timeAgo(Number(s.published_at)) : ''}
              </span>
              {s.country_code && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}> · {s.country_code}</span>
              )}
              {s.source_id && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-info)', opacity: 0.7 }}>{s.source_id}</span>
              )}
            </div>
          </div>
          <Badge severity={s.severity} size="sm" />
        </div>
      ))}
    </div>
  );
}

export default function Infrastructure() {
  const infraQuery = useSignals({ category: 'infrastructure', limit: 80 });
  const maritimeQuery = useSignals({ category: 'maritime', limit: 50 });
  const aviationQuery = useSignals({ category: 'aviation', limit: 50 });
  const cyberQuery = useSignals({ category: 'cyber', limit: 50 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infraSignals: any[] = (infraQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maritimeSignals: any[] = (maritimeQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aviationSignals: any[] = (aviationQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cyberSignals: any[] = (cyberQuery.data as any)?.data ?? [];

  const allSignals = [...infraSignals, ...maritimeSignals, ...aviationSignals, ...cyberSignals];
  const infraStressValue: number = indicesData.infra_stress ?? 0;
  const infoVelocity: number = indicesData.info_velocity ?? 0;

  // Severity distribution across all sectors
  const severityDist = useMemo(() => {
    const buckets = [
      { name: 'Critical', min: 67, count: 0, color: '#f87171' },
      { name: 'Elevated', min: 34, count: 0, color: '#fbbf24' },
      { name: 'Low', min: 0, count: 0, color: '#4ade80' },
    ];
    for (const s of allSignals) {
      for (const b of buckets) {
        if (s.severity >= b.min) { b.count++; break; }
      }
    }
    return buckets;
  }, [allSignals]);

  // Activity timeline (24h)
  const timelineData = useMemo(() => {
    const now = Date.now();
    const bins: Record<string, { time: string; infra: number; maritime: number; aviation: number; cyber: number }> = {};
    for (let h = 23; h >= 0; h--) {
      bins[`${h}h`] = { time: `${h}h`, infra: 0, maritime: 0, aviation: 0, cyber: 0 };
    }
    const categorize = (signals: typeof allSignals, key: 'infra' | 'maritime' | 'aviation' | 'cyber') => {
      for (const s of signals) {
        const hoursAgo = Math.floor((now - Number(s.published_at)) / 3_600_000);
        if (hoursAgo >= 0 && hoursAgo < 24) {
          const bin = bins[`${hoursAgo}h`];
          if (bin) bin[key]++;
        }
      }
    };
    categorize(infraSignals, 'infra');
    categorize(maritimeSignals, 'maritime');
    categorize(aviationSignals, 'aviation');
    categorize(cyberSignals, 'cyber');
    return Object.values(bins).reverse();
  }, [infraSignals, maritimeSignals, aviationSignals, cyberSignals]);

  // Country breakdown
  const countryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of allSignals) {
      if (s.country_code) {
        map[s.country_code] = (map[s.country_code] ?? 0) + 1;
      }
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [allSignals]);

  const sectors = [
    { label: 'Net/Cloud', count: infraSignals.length, icon: '🖧', color: '#38bdf8' },
    { label: 'Maritime', count: maritimeSignals.length, icon: '⚓', color: '#22d3ee' },
    { label: 'Aviation', count: aviationSignals.length, icon: '✈', color: '#a78bfa' },
    { label: 'Cyber', count: cyberSignals.length, icon: '🛡', color: '#f87171' },
  ];

  const criticalCount = allSignals.filter((s) => s.severity >= 67).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 className="section-title" style={{ margin: 0 }}>
        Infrastructure
      </h2>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <Card glow={infraStressValue >= 67 ? 'danger' : infraStressValue >= 34 ? 'warning' : undefined}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
            <RiskGauge value={infraStressValue} label="INFRA STRESS" size={110} />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
            <RiskGauge value={infoVelocity} label="INFO VELOCITY" size={110} />
          </div>
        </Card>

        <Card title="Sector Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
            {sectors.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{s.icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: s.color }}>
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Threat Summary">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '4px 0' }}>
            <div>
              <div className="metric-value" style={{ color: 'var(--color-info)', fontSize: '26px' }}>{allSignals.length}</div>
              <span className="metric-sublabel">Total Signals</span>
            </div>
            <div>
              <div className="metric-value" style={{ color: '#f87171', fontSize: '26px' }}>{criticalCount}</div>
              <span className="metric-sublabel">Critical</span>
            </div>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {severityDist.map((b) => (
              <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', flex: 1 }}>{b.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: b.color, fontWeight: 600 }}>{b.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity timeline */}
      {timelineData.some((d) => d.infra + d.maritime + d.aviation + d.cyber > 0) && (
        <Card title="Activity Timeline (24h)">
          <AreaChart
            data={timelineData}
            series={[
              { key: 'infra', label: 'Net/Cloud', color: '#38bdf8' },
              { key: 'maritime', label: 'Maritime', color: '#22d3ee' },
              { key: 'aviation', label: 'Aviation', color: '#a78bfa' },
              { key: 'cyber', label: 'Cyber', color: '#f87171' },
            ]}
            xKey="time"
            height={160}
            showGrid
            showLegend
            stacked
          />
        </Card>
      )}

      {/* Country breakdown chart */}
      {countryBreakdown.length > 0 && (
        <Card title="Signals by Country">
          <BarChart
            data={countryBreakdown}
            series={[{ key: 'count', label: 'Signals', color: '#38bdf8' }]}
            xKey="name"
            height={160}
            showGrid={false}
          />
        </Card>
      )}

      {/* Signal feeds */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <Card title="Net/Cloud Anomalies" headerRight={<span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#38bdf8' }}>{infraSignals.length}</span>}>
          <SignalList signals={infraSignals} loading={infraQuery.isLoading} />
        </Card>
        <Card title="Maritime" headerRight={<span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#22d3ee' }}>{maritimeSignals.length}</span>}>
          <SignalList signals={maritimeSignals} loading={maritimeQuery.isLoading} />
        </Card>
        <Card title="Aviation" headerRight={<span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#a78bfa' }}>{aviationSignals.length}</span>}>
          <SignalList signals={aviationSignals} loading={aviationQuery.isLoading} />
        </Card>
        <Card title="Cyber Threats" headerRight={<span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f87171' }}>{cyberSignals.length}</span>}>
          <SignalList signals={cyberSignals} loading={cyberQuery.isLoading} />
        </Card>
      </div>
    </div>
  );
}
