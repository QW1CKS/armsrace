import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
import { Ticker } from '../../components/ui/Ticker.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { GeoMap } from '../../components/map/GeoMap.js';
import { AlertFeed } from '../../components/alerts/AlertFeed.js';
import { useIndices } from '../../hooks/useIndices.js';
import { useAlerts } from '../../hooks/useAlerts.js';
import { useSignals } from '../../hooks/useSignals.js';
import { severityColor } from '../../styles/tokens.js';
import { useAlertContext } from '../../context/AlertContext.js';
import { useQueryClient } from '@tanstack/react-query';
import { acknowledgeAlert, dismissAlert } from '../../api/endpoints/alerts.js';

const TOP_MOVERS_MOCK = [
  { symbol: 'VIX', name: 'Volatility Index', change: '+12.4%', up: true },
  { symbol: 'BTC', name: 'Bitcoin', change: '-5.2%', up: false },
  { symbol: 'XAU', name: 'Gold', change: '+1.8%', up: true },
  { symbol: 'DXY', name: 'US Dollar', change: '+0.6%', up: true },
];

const CATEGORIES = ['all', 'conflict', 'hazard', 'cyber', 'military', 'infrastructure'];

export default function MissionControl() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;
  const alertsQuery = useAlerts({ limit: 8 });
  const signalsQuery = useSignals({ limit: 500 });
  const { unreadCount } = useAlertContext();
  const queryClient = useQueryClient();
  const [geoFilter, setGeoFilter] = useState<string>('all');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alerts: any[] = (alertsQuery.data as any)?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signals: any[] = (signalsQuery.data as any)?.data ?? [];

  const giiValue: number = indicesData.global_instability ?? 0;
  const marketStressValue: number = indicesData.market_stress ?? 0;
  const infraStressValue: number = indicesData.infra_stress ?? 0;
  const infoVelocityValue: number = indicesData.info_velocity ?? 0;

  const mapEvents = signals
    .filter((s) => s.lat != null && s.lon != null)
    .filter((s) => geoFilter === 'all' || s.category === geoFilter)
    .map((s) => ({
      id: s.id,
      lat: s.lat,
      lon: s.lon,
      title: s.title,
      category: s.category,
      severity: s.severity,
      confidence: s.confidence,
      source: s.source_id,
      country: s.country_code,
      publishedAt: new Date(Number(s.published_at)).toISOString(),
      body: s.summary,
    }));

  const tickerItems = alerts.slice(0, 20).map((a) => ({
    id: a.id,
    text: a.title,
    severity: a.severity,
  }));

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const handleDismiss = async (id: string) => {
    await dismissAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {tickerItems.length > 0 && <Ticker items={tickerItems} speed={50} />}

      {/* Risk Score Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <Card glow={giiValue >= 67 ? 'danger' : giiValue >= 34 ? 'warning' : undefined}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
            {indicesData.isLoading ? <Spinner size={36} /> : (
              <RiskGauge value={giiValue} label="Global Instability" size={120} />
            )}
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            {indicesData.isLoading ? <Spinner size={36} /> : (
              <RiskGauge value={marketStressValue} label="Market Stress" size={100} />
            )}
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            {indicesData.isLoading ? <Spinner size={36} /> : (
              <RiskGauge value={infraStressValue} label="Infra Stress" size={100} />
            )}
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
            {indicesData.isLoading ? <Spinner size={36} /> : (
              <RiskGauge value={infoVelocityValue} label="Info Velocity" size={100} />
            )}
          </div>
        </Card>
      </div>

      {/* Map + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        <Card title="Live Signal Map">
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setGeoFilter(cat)}
                style={{
                  padding: '3px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${geoFilter === cat ? 'var(--color-info)' : 'var(--border-subtle)'}`,
                  background: geoFilter === cat ? 'rgba(137,180,250,0.1)' : 'transparent',
                  color: geoFilter === cat ? 'var(--color-info)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <GeoMap events={mapEvents} height={420} loading={signalsQuery.isLoading} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card title="Top Movers">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {TOP_MOVERS_MOCK.map((m) => (
                <div key={m.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', minWidth: '36px' }}>
                    {m.symbol}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flex: 1 }}>{m.name}</span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: m.up ? severityColor(20) : severityColor(80) }}>
                    {m.change}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card title={`Live Alerts${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}>
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              <AlertFeed
                alerts={alerts}
                loading={alertsQuery.isLoading}
                compact
                onAcknowledge={handleAcknowledge}
                onDismiss={handleDismiss}
                maxItems={6}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
