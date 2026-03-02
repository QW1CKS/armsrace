import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAlertContext } from '../../context/AlertContext.js';
import { useSSE } from '../../context/SSEContext.js';
import { useIndices } from '../../hooks/useIndices.js';
import { useSettings, type TimeRange } from '../../context/SettingsContext.js';
import { severityColor } from '../../styles/tokens.js';
import { CommandPalette } from '../ui/CommandPalette.js';

const NAV_ITEMS = [
  { path: '/',              label: 'Overview',     icon: '⬡' },
  { path: '/geopolitics',   label: 'Geopolitics',  icon: '◈' },
  { path: '/markets',       label: 'Markets',      icon: '△' },
  { path: '/infrastructure', label: 'Infra',       icon: '⬢' },
  { path: '/predictions',   label: 'Forecast',     icon: '◎' },
  { path: '/alerts',        label: 'Alerts',       icon: '◻' },
  { path: '/sources',       label: 'Sources',      icon: '◉' },
  { path: '/settings',      label: 'Settings',     icon: '⚙' },
];

const TIME_LABELS: Record<TimeRange, string> = {
  '1h': '1H', '6h': '6H', '24h': '24H', '3d': '3D', '7d': '7D', '30d': '30D', 'all': '∞',
};

export function FloatingNav() {
  const { unreadCount } = useAlertContext();
  const { connected } = useSSE();
  const { settings, updateSettings } = useSettings();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicesData = useIndices() as any;
  const gii = Math.round((indicesData.global_instability as number) ?? 0);
  const giiColor = severityColor(gii);
  const threatLabel = gii >= 67 ? 'CRIT' : gii >= 34 ? 'ELEV' : 'NOM';

  const [time, setTime] = useState(new Date());
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Cycle through time ranges on click */
  const TIME_ORDER: TimeRange[] = ['1h', '6h', '24h', '3d', '7d', '30d', 'all'];
  const cycleTime = () => {
    const idx = TIME_ORDER.indexOf(settings.timeRange);
    updateSettings({ timeRange: TIME_ORDER[(idx + 1) % TIME_ORDER.length] });
  };

  return (
    <>
      <nav className="floating-nav">
        {/* Brand */}
        <div className="nav-brand">
          <div className="nav-logo">AR</div>
          <span className="nav-brand-text">ARMSRACE</span>
        </div>

        {/* Nav links */}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/alerts' && unreadCount > 0 && (
              <span className="nav-alert-dot" />
            )}
          </NavLink>
        ))}

        {/* ── Quick controls in the nav ── */}
        <div className="nav-controls">
          {/* Search trigger */}
          <button className="nav-ctrl-btn" onClick={() => setCmdOpen(true)} title="Command Palette (Ctrl+K)">
            <span style={{ fontSize: '13px' }}>⌘K</span>
          </button>

          {/* Time range quick-cycle */}
          <button className="nav-ctrl-btn" onClick={cycleTime} title={`Time: ${settings.timeRange}`}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{TIME_LABELS[settings.timeRange]}</span>
          </button>
        </div>

        {/* Status section */}
        <div className="nav-status">
          <span className={`threat-badge ${gii >= 67 ? 'critical' : gii >= 34 ? 'elevated' : 'nominal'}`}>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>{gii}</span>
            <span style={{ fontSize: '11px' }}>{threatLabel}</span>
          </span>
          <span
            className="nav-live-dot"
            style={{ background: connected ? 'var(--color-success)' : 'var(--color-danger)' }}
            title={connected ? 'Live connection' : 'Disconnected'}
          />
          <span className="nav-clock">
            {time.toISOString().slice(11, 19)}Z
          </span>
        </div>
      </nav>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
