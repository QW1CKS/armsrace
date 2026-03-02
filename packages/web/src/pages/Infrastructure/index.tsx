import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
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
function SignalList({ signals, loading }: { signals: any[]; loading: boolean }) {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner size={20} /></div>;
  if (!signals.length) return <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No signals</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {signals.slice(0, 20).map((s, i) => (
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
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {s.published_at ? timeAgo(Number(s.published_at)) : ''}
              {s.country_code ? ` · ${s.country_code}` : ''}
            </div>
          </div>
          <Badge severity={s.severity} size="sm" />
        </div>
      ))}
    </div>
  );
}

export default function Infrastructure() {
  const infraQuery = useSignals({ category: 'infrastructure', limit: 50 });
  const maritimeQuery = useSignals({ category: 'maritime', limit: 30 });
  const aviationQuery = useSignals({ category: 'aviation', limit: 30 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infraSignals: any[] = (infraQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maritimeSignals: any[] = (maritimeQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aviationSignals: any[] = (aviationQuery.data as any)?.data ?? [];

  const infraStressValue: number = indicesData.infra_stress ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 className="section-title" style={{ margin: 0 }}>
        Infrastructure
      </h2>

      {/* Stress gauge row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <Card glow={infraStressValue >= 67 ? 'danger' : infraStressValue >= 34 ? 'warning' : undefined}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            <RiskGauge value={infraStressValue} label="INFRA STRESS" size={110} />
          </div>
        </Card>
        <Card>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Summary</div>
            {[
              { label: 'Net/Cloud', count: infraSignals.length },
              { label: 'Maritime', count: maritimeSignals.length },
              { label: 'Aviation', count: aviationSignals.length },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>{item.label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Three panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Card title="Net/Cloud Anomalies">
          <SignalList signals={infraSignals} loading={infraQuery.isLoading} />
        </Card>
        <Card title="Maritime">
          <SignalList signals={maritimeSignals} loading={maritimeQuery.isLoading} />
        </Card>
        <Card title="Aviation">
          <SignalList signals={aviationSignals} loading={aviationQuery.isLoading} />
        </Card>
      </div>
    </div>
  );
}
