import React from 'react';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
import { Ticker } from '../../components/ui/Ticker.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { AlertFeed } from '../../components/alerts/AlertFeed.js';
import { useIndices } from '../../hooks/useIndices.js';
import { useAlerts } from '../../hooks/useAlerts.js';
import { useSettings } from '../../context/SettingsContext.js';
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

export default function MissionControl() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;
  const alertsQuery = useAlerts({ limit: 6 });
  const { unreadCount } = useAlertContext();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const w = settings.widgets;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alerts: any[] = (alertsQuery.data as any)?.data ?? [];

  const giiValue: number = indicesData.global_instability ?? 0;
  const marketStressValue: number = indicesData.market_stress ?? 0;
  const infraStressValue: number = indicesData.infra_stress ?? 0;
  const infoVelocityValue: number = indicesData.info_velocity ?? 0;

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
    <div className="cmd-overview">
      {/* ── LEFT: Metric widgets ── */}
      <div className="cmd-metrics">
        {/* Global Instability */}
        {w.gii && (
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-label">Global Instability</span>
          </div>
          <div className="widget-body" style={{ display: 'flex', justifyContent: 'center' }}>
            {indicesData.isLoading ? <Spinner size={36} /> : <RiskGauge value={giiValue} label="GII" size={130} />}
          </div>
        </div>
        )}

        {/* Market Stress */}
        {w.marketStress && (
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-label">Market Stress</span>
          </div>
          <div className="widget-body" style={{ display: 'flex', justifyContent: 'center' }}>
            {indicesData.isLoading ? <Spinner size={28} /> : <RiskGauge value={marketStressValue} label="MKT" size={100} />}
          </div>
        </div>
        )}

        {/* Infrastructure / Info Velocity */}
        {w.infraInfo && (
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-label">Infra · Info</span>
          </div>
          <div className="widget-body" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {indicesData.isLoading ? <Spinner size={28} /> : (
              <>
                <RiskGauge value={infraStressValue} label="INFRA" size={80} />
                <RiskGauge value={infoVelocityValue} label="INFO" size={80} />
              </>
            )}
          </div>
        </div>
        )}

        {/* Market Movers */}
        {w.movers && (
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-label">Market Movers</span>
          </div>
          <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {TOP_MOVERS_MOCK.map((m) => (
              <div key={m.symbol} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-info)', minWidth: '34px', fontWeight: 500 }}>
                  {m.symbol}
                </span>
                <span style={{ flex: 1, fontSize: '11px', color: 'var(--text-muted)' }}>{m.name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                  color: m.up ? severityColor(20) : severityColor(80),
                }}>
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* ── BOTTOM: Ticker ── */}
      {w.ticker && (
      <div className="cmd-bottom">
        {tickerItems.length > 0 && <Ticker items={tickerItems} speed={44} />}
      </div>
      )}

      {/* ── RIGHT: Alerts ── */}
      {w.alerts && (
      <div className="cmd-right">
        <div className="widget-card" style={{ flex: 1 }}>
          <div className="widget-header">
            <span className="widget-label">
              Alerts{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </span>
            {unreadCount > 0 && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--color-danger)',
                boxShadow: '0 0 8px var(--color-danger)',
                animation: 'pulse-glow 2s ease infinite',
              }} />
            )}
          </div>
          <div className="widget-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <AlertFeed
              alerts={alerts}
              loading={alertsQuery.isLoading}
              compact
              onAcknowledge={handleAcknowledge}
              onDismiss={handleDismiss}
              maxItems={6}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
