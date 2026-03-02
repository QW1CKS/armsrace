import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAlertContext } from '../../context/AlertContext.js';
import { useSSE } from '../../context/SSEContext.js';

const NAV_ITEMS = [
  { path: '/',             label: 'CMD CENTER',    icon: '◆' },
  { path: '/geopolitics',  label: 'GEO-INT',       icon: '◈' },
  { path: '/markets',      label: 'MKT-OPS',       icon: '▲' },
  { path: '/infrastructure', label: 'INFRA-MON',   icon: '⬡' },
  { path: '/predictions',  label: 'FORECAST',      icon: '◎' },
  { path: '/alerts',       label: 'ALERTS',        icon: '▣' },
  { path: '/sources',      label: 'DATA-SRC',      icon: '◉' },
  { path: '/settings',     label: 'CONFIG',        icon: '⚙' },
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
      position: 'relative',
    }}>
      {/* Accent line on right edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, var(--color-cyan), transparent 40%, transparent 60%, var(--color-cyan))',
        opacity: 0.15,
      }} />

      {/* Logo Header */}
      <div style={{
        padding: '14px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Hex logo mark */}
        <div style={{
          width: 26,
          height: 26,
          border: '2px solid var(--color-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--color-cyan)',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 0 12px rgba(0, 212, 255, 0.25), inset 0 0 8px rgba(0, 212, 255, 0.1)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: 'rgba(0, 212, 255, 0.08)',
        }}>AR</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: '12px',
            letterSpacing: '0.16em',
            color: 'var(--color-cyan)',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.4)',
          }}>
            ARMSRACE
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
          }}>
            MONITOR v1.0
          </span>
        </div>

        {/* Connection status */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <div style={{
            width: 5,
            height: 5,
            background: connected ? 'var(--color-success)' : 'var(--color-danger)',
            boxShadow: connected
              ? '0 0 8px var(--color-success), 0 0 16px rgba(0, 255, 106, 0.3)'
              : '0 0 8px var(--color-danger)',
            animation: 'pulse-glow 2s ease infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '7px',
            letterSpacing: '0.1em',
            color: connected ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            {connected ? 'LIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* System label */}
      <div style={{
        padding: '8px 12px 4px',
        fontFamily: 'var(--font-mono)',
        fontSize: '8px',
        letterSpacing: '0.2em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        ▸ NAVIGATION
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '4px 0', overflow: 'auto' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span style={{
              fontSize: '10px',
              lineHeight: 1,
              width: 16,
              textAlign: 'center',
              color: 'inherit',
              opacity: 0.7,
            }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/alerts' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--color-danger)',
                color: 'var(--text-bright)',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                padding: '1px 5px',
                minWidth: '16px',
                textAlign: 'center',
                boxShadow: '0 0 10px rgba(255, 36, 36, 0.4)',
                clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))',
              }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-mono)',
        fontSize: '8px',
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>SYS:NOMINAL</span>
        <span>LOCAL-NET</span>
      </div>
    </nav>
  );
}
