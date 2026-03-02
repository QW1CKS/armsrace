import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import {
  useSettings,
  MAP_STYLES,
  ACCENT_COLORS,
  type MapStyleKey,
  type AccentKey,
  type UIDensity,
  type TimeRange,
  type WidgetVisibility,
} from '../../context/SettingsContext.js';

const API_KEY_FIELDS = [
  { envKey: 'ACLED_API_KEY', label: 'ACLED API Key', hint: 'Armed Conflict Location & Event Data', url: 'https://acleddata.com/register/' },
  { envKey: 'FRED_API_KEY', label: 'FRED API Key', hint: 'Federal Reserve Economic Data', url: 'https://fred.stlouisfed.org/docs/api/api_key.html' },
  { envKey: 'EIA_API_KEY', label: 'EIA API Key', hint: 'US Energy Information Administration', url: 'https://www.eia.gov/opendata/register.php' },
  { envKey: 'FINNHUB_API_KEY', label: 'Finnhub API Key', hint: 'Real-time stocks & financials', url: 'https://finnhub.io/' },
  { envKey: 'OTX_API_KEY', label: 'AlienVault OTX Key', hint: 'Threat intelligence pulses', url: 'https://otx.alienvault.com/' },
  { envKey: 'ABUSEIPDB_API_KEY', label: 'AbuseIPDB Key', hint: 'Malicious IP database', url: 'https://www.abuseipdb.com/register' },
  { envKey: 'NASA_FIRMS_MAP_KEY', label: 'NASA FIRMS Map Key', hint: 'Fire Information for Resource Management', url: 'https://firms.modaps.eosdis.nasa.gov/api/area/' },
  { envKey: 'CLOUDFLARE_API_TOKEN', label: 'Cloudflare API Token', hint: 'Internet traffic anomalies via Cloudflare Radar', url: 'https://dash.cloudflare.com/profile/api-tokens' },
  { envKey: 'HAPI_APP_IDENTIFIER', label: 'HAPI App Identifier', hint: 'Humanitarian API (optional)', url: 'https://hapi.humdata.org/' },
  { envKey: 'AVIATIONSTACK_API_KEY', label: 'AviationStack Key', hint: 'Real-time flight data', url: 'https://aviationstack.com/' },
  { envKey: 'POLYMARKET_API_KEY', label: 'Polymarket API Key', hint: 'Prediction market data', url: 'https://docs.polymarket.com/' },
];

export default function Settings() {
  const { settings, updateSettings, setApiKey, toggleWidget } = useSettings();
  const [saved, setSaved] = useState(false);
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(settings.apiKeys ?? {});

  const handleSave = () => {
    for (const [key, val] of Object.entries(localKeys)) {
      setApiKey(key, val);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <h2 className="section-title" style={{ margin: 0 }}>
        Settings
      </h2>

      {/* Notifications */}
      <Card title="Notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.desktopNotifications}
              onChange={(e) => updateSettings({ desktopNotifications: e.target.checked })}
              style={{ accentColor: 'var(--color-info)', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Desktop Notifications</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Browser push for critical alerts (severity ≥ 70)</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.openBrowserOnStart}
              onChange={(e) => updateSettings({ openBrowserOnStart: e.target.checked })}
              style={{ accentColor: 'var(--color-info)', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Auto-open Browser</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Open browser on API start</div>
            </div>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-primary)', minWidth: '160px' }}>
              Data Retention
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={settings.dataRetentionDays}
              onChange={(e) => updateSettings({ dataRetentionDays: Number(e.target.value) })}
              style={{
                width: '80px',
                padding: '5px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>
      </Card>

      {/* Interface Customization */}
      <Card title="Interface">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Map Style */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px' }}>Map Style</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(Object.entries(MAP_STYLES) as [MapStyleKey, { label: string }][]).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`chip-btn${settings.mapStyle === key ? ' active' : ''}`}
                  onClick={() => updateSettings({ mapStyle: key })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px' }}>Accent Color</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.entries(ACCENT_COLORS) as [AccentKey, string][]).map(([key, hex]) => (
                <button
                  key={key}
                  onClick={() => updateSettings({ accentColor: key })}
                  title={key}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: settings.accentColor === key ? '2px solid var(--text-primary)' : '2px solid transparent',
                    background: hex,
                    cursor: 'pointer',
                    boxShadow: settings.accentColor === key ? `0 0 0 2px var(--bg-base), 0 0 0 4px ${hex}` : `0 2px 6px rgba(0,0,0,0.3)`,
                    transition: 'all 120ms ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px' }}>Density</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['compact', 'comfortable', 'spacious'] as UIDensity[]).map((d) => (
                <button
                  key={d}
                  className={`chip-btn${settings.density === d ? ' active' : ''}`}
                  onClick={() => updateSettings({ density: d })}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Opacity */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px' }}>
              Panel Opacity — {Math.round(settings.panelOpacity * 100)}%
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={Math.round(settings.panelOpacity * 100)}
              onChange={(e) => updateSettings({ panelOpacity: Number(e.target.value) / 100 })}
              style={{ width: '100%', accentColor: 'var(--color-info)', cursor: 'pointer' }}
            />
          </div>

          {/* Default Time Range */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px' }}>Default Time Range</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(['1h', '6h', '24h', '3d', '7d', '30d', 'all'] as TimeRange[]).map((t) => (
                <button
                  key={t}
                  className={`chip-btn${settings.timeRange === t ? ' active' : ''}`}
                  onClick={() => updateSettings({ timeRange: t })}
                >
                  {t === 'all' ? 'All Time' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Map Layers */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px' }}>Map Layers</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={settings.showHeatmap} onChange={() => updateSettings({ showHeatmap: !settings.showHeatmap })} style={{ accentColor: 'var(--color-info)' }} />
                Heatmap
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={settings.showMarkers} onChange={() => updateSettings({ showMarkers: !settings.showMarkers })} style={{ accentColor: 'var(--color-info)' }} />
                Markers
              </label>
            </div>
          </div>

          {/* Overview Widgets */}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px' }}>Overview Widgets</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px' }}>
              {([
                ['gii', 'Global Instability'],
                ['marketStress', 'Market Stress'],
                ['infraInfo', 'Infra / Info'],
                ['movers', 'Market Movers'],
                ['ticker', 'Alert Ticker'],
                ['alerts', 'Alert Feed'],
              ] as [keyof WidgetVisibility, string][]).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={settings.widgets[key]} onChange={() => toggleWidget(key)} style={{ accentColor: 'var(--color-info)' }} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card title="API Keys (Optional)">
        <div style={{ marginBottom: '12px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          API keys are stored in localStorage and sent to the local API server only.
          For permanent configuration, add them to your <code
            style={{ background: 'var(--bg-surface)', padding: '1px 4px', fontFamily: 'var(--font-mono)', color: 'var(--color-info)', borderRadius: '3px' }}
          >.env</code> file and restart the worker.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {API_KEY_FIELDS.map((field) => (
            <div key={field.envKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {field.label}
                </label>
                <a
                  href={field.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '11px', color: 'var(--color-info)', textDecoration: 'none' }}
                >
                  Get Key →
                </a>
              </div>
              <input
                type="password"
                placeholder={`${field.envKey}=...`}
                value={localKeys[field.envKey] ?? ''}
                onChange={(e) => setLocalKeys((prev) => ({ ...prev, [field.envKey]: e.target.value }))}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{field.hint}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSave}
            className="chip-btn active"
            style={{ padding: '7px 20px', fontWeight: 600 }}
          >
            Save Keys
          </button>
          {saved && (
            <span style={{ fontSize: '12px', color: 'var(--color-success)' }}>
              ✓ Saved to localStorage
            </span>
          )}
        </div>
      </Card>

      {/* About */}
      <Card title="About">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div><strong style={{ color: 'var(--color-info)' }}>ArmsRace Monitor</strong> — Localhost-only geopolitical intelligence and markets dashboard.</div>
          <div>All data is fetched directly from public sources. No analytics, no telemetry, no external CDN.</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <strong style={{ color: 'var(--color-warning)' }}>Disclaimer:</strong> ArmsRace Monitor provides informational analytics and scenario modeling only.
            Predictions are probabilistic outputs, not guarantees or advice.
            Always verify critical decisions with primary sources.
          </div>
        </div>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card title="Keyboard Shortcuts">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            ['Ctrl + K', 'Open Command Palette'],
            ['Escape', 'Close palette / popover'],
            ['↑ / ↓', 'Navigate command list'],
            ['Enter', 'Execute selected command'],
          ].map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <kbd style={{
                padding: '2px 8px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'var(--bg-hover)',
                minWidth: '80px',
                textAlign: 'center',
              }}>{key}</kbd>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
