import React, { useState, useCallback, useMemo } from 'react';
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
} from 'react-grid-layout';
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
import { RiskGauge } from '../../components/ui/RiskGauge.js';
import { Ticker } from '../../components/ui/Ticker.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { AlertFeed } from '../../components/alerts/AlertFeed.js';
import { LiveFeedPanel } from '../../components/ui/LiveFeedPanel.js';
import { useIndices } from '../../hooks/useIndices.js';
import { useAlerts } from '../../hooks/useAlerts.js';
import { useSettings } from '../../context/SettingsContext.js';
import { severityColor } from '../../styles/tokens.js';
import { useAlertContext } from '../../context/AlertContext.js';
import { useQueryClient } from '@tanstack/react-query';
import { acknowledgeAlert, dismissAlert } from '../../api/endpoints/alerts.js';

import 'react-grid-layout/css/styles.css';

/* ── Layout persistence ────────────────────────────────────── */
const STORAGE_KEY = 'armsrace-grid-layouts';

function loadLayouts(): ResponsiveLayouts | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLayouts(layouts: ResponsiveLayouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
}

/* ── Default grid layouts per breakpoint ─────────────────── */
const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: [
    { i: 'gii',          x: 0,  y: 0,  w: 3,  h: 5, minW: 2, minH: 3 },
    { i: 'marketStress',  x: 0,  y: 5,  w: 3,  h: 4, minW: 2, minH: 3 },
    { i: 'infraInfo',     x: 0,  y: 9,  w: 3,  h: 4, minW: 2, minH: 3 },
    { i: 'movers',        x: 0,  y: 13, w: 3,  h: 5, minW: 2, minH: 3 },
    { i: 'ticker',        x: 3,  y: 18, w: 6,  h: 2, minW: 4, minH: 1 },
    { i: 'alerts',        x: 9,  y: 0,  w: 3,  h: 8, minW: 2, minH: 3 },
    { i: 'liveFeed',      x: 9,  y: 8,  w: 3,  h: 10, minW: 2, minH: 5 },
  ],
  md: [
    { i: 'gii',          x: 0, y: 0,  w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'marketStress',  x: 0, y: 5,  w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'infraInfo',     x: 0, y: 9,  w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'movers',        x: 0, y: 13, w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'ticker',        x: 3, y: 16, w: 4, h: 2, minW: 3, minH: 1 },
    { i: 'alerts',        x: 7, y: 0,  w: 3, h: 8, minW: 2, minH: 3 },
    { i: 'liveFeed',      x: 7, y: 8,  w: 3, h: 10, minW: 2, minH: 5 },
  ],
  sm: [
    { i: 'gii',          x: 0, y: 0,  w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'marketStress',  x: 3, y: 0,  w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'infraInfo',     x: 0, y: 5,  w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'movers',        x: 3, y: 5,  w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'ticker',        x: 0, y: 14, w: 6, h: 2, minW: 3, minH: 1 },
    { i: 'alerts',        x: 0, y: 9,  w: 6, h: 5, minW: 2, minH: 3 },
    { i: 'liveFeed',      x: 0, y: 16, w: 6, h: 8, minW: 2, minH: 5 },
  ],
};

const TOP_MOVERS_MOCK = [
  { symbol: 'VIX', name: 'Volatility Index', change: '+12.4%', up: true },
  { symbol: 'BTC', name: 'Bitcoin', change: '-5.2%', up: false },
  { symbol: 'XAU', name: 'Gold', change: '+1.8%', up: true },
  { symbol: 'DXY', name: 'US Dollar', change: '+0.6%', up: true },
];

export default function MissionControl() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;
  const alertsQuery = useAlerts({ limit: 10 });
  const { unreadCount } = useAlertContext();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1280 });

  const w = settings.widgets;

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => loadLayouts() ?? DEFAULT_LAYOUTS);
  const [isLocked, setIsLocked] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alerts: any[] = (alertsQuery.data as any)?.data ?? [];

  const giiValue: number = indicesData.global_instability ?? 0;
  const marketStressValue: number = indicesData.market_stress ?? 0;
  const infraStressValue: number = indicesData.infra_stress ?? 0;
  const infoVelocityValue: number = indicesData.info_velocity ?? 0;

  const tickerItems = alerts.slice(0, 20).map((a: { id: string; title: string; severity: number | string }) => ({
    id: a.id,
    text: a.title,
    severity: typeof a.severity === 'number' ? a.severity : Number(a.severity) || 0,
  }));

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const handleDismiss = async (id: string) => {
    await dismissAlert(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const onLayoutChange = useCallback((_current: Layout, allLayouts: ResponsiveLayouts) => {
    setLayouts(allLayouts);
    saveLayouts(allLayouts);
  }, []);

  const resetLayout = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    saveLayouts(DEFAULT_LAYOUTS);
  }, []);

  /* Build only the visible widget keys */
  const visibleKeys = useMemo(() => {
    const keys: string[] = [];
    if (w.gii) keys.push('gii');
    if (w.marketStress) keys.push('marketStress');
    if (w.infraInfo) keys.push('infraInfo');
    if (w.movers) keys.push('movers');
    if (w.ticker) keys.push('ticker');
    if (w.alerts) keys.push('alerts');
    if (w.liveFeed) keys.push('liveFeed');
    return keys;
  }, [w]);

  /* Filter layouts to only include visible widgets */
  const filteredLayouts = useMemo(() => {
    const out: ResponsiveLayouts = {};
    for (const [bp, items] of Object.entries(layouts)) {
      if (items) {
        out[bp] = (items as readonly LayoutItem[]).filter((l) => visibleKeys.includes(l.i));
      }
    }
    return out;
  }, [layouts, visibleKeys]);

  const renderWidget = (key: string) => {
    switch (key) {
      case 'gii':
        return (
          <div key="gii" className="grid-widget">
            <div className="widget-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="widget-header grid-drag-handle">
                <span className="widget-label">Global Instability</span>
                <span className="drag-hint">⠿</span>
              </div>
              <div className="widget-body" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {indicesData.isLoading ? <Spinner size={36} /> : <RiskGauge value={giiValue} label="GII" size={130} />}
              </div>
            </div>
          </div>
        );

      case 'marketStress':
        return (
          <div key="marketStress" className="grid-widget">
            <div className="widget-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="widget-header grid-drag-handle">
                <span className="widget-label">Market Stress</span>
                <span className="drag-hint">⠿</span>
              </div>
              <div className="widget-body" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {indicesData.isLoading ? <Spinner size={28} /> : <RiskGauge value={marketStressValue} label="MKT" size={100} />}
              </div>
            </div>
          </div>
        );

      case 'infraInfo':
        return (
          <div key="infraInfo" className="grid-widget">
            <div className="widget-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="widget-header grid-drag-handle">
                <span className="widget-label">Infra · Info</span>
                <span className="drag-hint">⠿</span>
              </div>
              <div className="widget-body" style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                {indicesData.isLoading ? <Spinner size={28} /> : (
                  <>
                    <RiskGauge value={infraStressValue} label="INFRA" size={80} />
                    <RiskGauge value={infoVelocityValue} label="INFO" size={80} />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'movers':
        return (
          <div key="movers" className="grid-widget">
            <div className="widget-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="widget-header grid-drag-handle">
                <span className="widget-label">Market Movers</span>
                <span className="drag-hint">⠿</span>
              </div>
              <div className="widget-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                {TOP_MOVERS_MOCK.map((m) => (
                  <div key={m.symbol} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '4px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-info)', minWidth: '34px', fontWeight: 500 }}>
                      {m.symbol}
                    </span>
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-muted)' }}>{m.name}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
                      color: m.up ? severityColor(20) : severityColor(80),
                    }}>
                      {m.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ticker':
        return (
          <div key="ticker" className="grid-widget">
            <div className="widget-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="widget-header grid-drag-handle">
                <span className="widget-label">Alert Ticker</span>
                <span className="drag-hint">⠿</span>
              </div>
              <div className="widget-body" style={{ flex: 1, overflow: 'hidden' }}>
                {tickerItems.length > 0 ? <Ticker items={tickerItems} speed={44} /> : (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No active alerts</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div key="alerts" className="grid-widget">
            <div className="widget-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="widget-header grid-drag-handle">
                <span className="widget-label">
                  Alerts{unreadCount > 0 ? ` (${unreadCount})` : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {unreadCount > 0 && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--color-danger)',
                      boxShadow: '0 0 8px var(--color-danger)',
                      animation: 'pulse-glow 2s ease infinite',
                    }} />
                  )}
                  <span className="drag-hint">⠿</span>
                </div>
              </div>
              <div className="widget-body" style={{ flex: 1, overflowY: 'auto' }}>
                <AlertFeed
                  alerts={alerts}
                  loading={alertsQuery.isLoading}
                  compact
                  onAcknowledge={handleAcknowledge}
                  onDismiss={handleDismiss}
                  maxItems={10}
                />
              </div>
            </div>
          </div>
        );

      case 'liveFeed':
        return (
          <div key="liveFeed" className="grid-widget">
            <div style={{ height: '100%' }}>
              <LiveFeedPanel />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cmd-overview-grid" ref={containerRef as React.RefObject<HTMLDivElement>}>
      {/* Grid toolbar */}
      <div className="grid-toolbar">
        <button
          className={`grid-toolbar-btn${isLocked ? ' active' : ''}`}
          onClick={() => setIsLocked(!isLocked)}
          title={isLocked ? 'Unlock widgets' : 'Lock widgets'}
        >
          {isLocked ? '🔒' : '🔓'}
          <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
        </button>
        <button
          className="grid-toolbar-btn"
          onClick={resetLayout}
          title="Reset layout to default"
        >
          ↻ <span>Reset</span>
        </button>
      </div>

      {mounted && (
        <ResponsiveGridLayout
          className="overview-grid"
          width={width}
          layouts={filteredLayouts}
          breakpoints={{ lg: 1200, md: 900, sm: 600 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={32}
          margin={[10, 10] as const}
          containerPadding={[0, 0] as const}
          dragConfig={{ enabled: !isLocked, handle: '.grid-drag-handle' }}
          resizeConfig={{ enabled: !isLocked }}
          compactor={verticalCompactor}
          onLayoutChange={onLayoutChange}
          autoSize
        >
          {visibleKeys.map(renderWidget)}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
