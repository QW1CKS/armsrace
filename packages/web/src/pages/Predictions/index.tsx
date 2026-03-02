import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { ConfidenceBar } from '../../components/ui/ConfidenceBar.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { useQuery } from '@tanstack/react-query';
import { getPredictions } from '../../api/endpoints/predictions.js';
import { severityColor } from '../../styles/tokens.js';
import { APP_DISCLAIMER, FORECAST_DISCLAIMER } from '@armsrace/shared';

const HORIZON_LABELS: Record<string, string> = {
  '24h': '24 Hours',
  '72h': '72 Hours',
  '7d': '7 Days',
};

function DisclaimerBanner() {
  return (
    <div style={{
      background: 'rgba(245,184,75,0.08)',
      border: '1px solid rgba(245,184,75,0.3)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
    }}>
      <span style={{ fontWeight: 600, color: '#F5B84B' }}>DISCLAIMER: </span>
      {APP_DISCLAIMER}
    </div>
  );
}

function timeAgo(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function Predictions() {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        Predictions & Scenarios
      </h2>

      <DisclaimerBanner />

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Spinner />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No forecasts available yet — forecasts are computed every 30 minutes once signals are ingested.
          </div>
        </Card>
      ) : (
        ['24h', '72h', '7d'].map((horizon) => {
          const items = grouped[horizon] ?? [];
          if (items.length === 0) return null;
          return (
            <section key={horizon}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                {HORIZON_LABELS[horizon] ?? horizon} Outlook
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {items.map((f) => {
                  const prob = Number(f.probability ?? 0);
                  const genAt = Number(f.generated_at ?? 0);
                  return (
                    <Card key={f.id} glow={prob >= 0.7 ? 'warning' : undefined}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>
                            {f.subject ?? f.title ?? 'Scenario'}
                          </div>
                          <span style={{ fontSize: '20px', fontWeight: 800, color: severityColor(Math.round(prob * 100)), flexShrink: 0 }}>
                            {Math.round(prob * 100)}%
                          </span>
                        </div>

                        <ConfidenceBar value={prob} />

                        {f.narrative && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {f.narrative}
                          </div>
                        )}

                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                          Subject: {f.subject_type} · Generated {genAt ? timeAgo(genAt) : '—'}
                        </div>

                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                          {FORECAST_DISCLAIMER}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
