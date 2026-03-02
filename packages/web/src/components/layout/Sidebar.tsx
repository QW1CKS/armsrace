import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAlertContext } from '../../context/AlertContext.js';
import { useSSE } from '../../context/SSEContext.js';

const NAV_ITEMS = [
  { path: '/',             label: 'Mission Control', icon: '⬡' },
  { path: '/geopolitics',  label: 'Geopolitics',     icon: '🌐' },
  { path: '/markets',      label: 'Markets',          icon: '📈' },
  { path: '/infrastructure', label: 'Infrastructure', icon: '🔧' },
  { path: '/predictions',  label: 'Predictions',      icon: '🔮' },
  { path: '/alerts',       label: 'Alerts',           icon: '🔔' },
  { path: '/sources',      label: 'Data Sources',     icon: '📡' },
  { path: '/settings',     label: 'Settings',         icon: '⚙' },
];

export function Sidebar() {
  const { unreadCount } = useAlertContext();
  const { connected } = useSSE();

  return (
    <nav style={{
      width: 'var(--sidebar-width)',
      minWidth: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, #FF5D5D, #F5B84B)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: '#070B12',
        }}>⬡</div>
        <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
          ARMSRACE
        </span>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: connected ? 'var(--color-success)' : 'var(--color-danger)',
          marginLeft: 'auto',
          boxShadow: connected ? '0 0 6px var(--color-success)' : 'none',
        }} title={connected ? 'Live' : 'Disconnected'} />
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '8px 0', overflow: 'auto' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 16px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-raised)' : 'transparent',
              borderLeft: `2px solid ${isActive ? 'var(--color-info)' : 'transparent'}`,
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 500 : 400,
              transition: 'var(--transition-fast)',
              position: 'relative',
            })}
          >
            <span style={{ fontSize: '15px', lineHeight: 1, width: 20, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/alerts' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--color-danger)',
                color: 'white',
                borderRadius: '10px',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                padding: '1px 6px',
                minWidth: '18px',
                textAlign: 'center',
              }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
      }}>
        v1.0 • Localhost Only
      </div>
    </nav>
  );
}
