import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { useSettings } from '../../context/SettingsContext.js';

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
  const { settings, updateSettings, setApiKey } = useSettings();
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
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
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
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Desktop Notifications</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Browser push notifications for critical alerts (severity ≥ 70)</div>
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
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Auto-open Browser</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Open browser automatically when API starts</div>
            </div>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', minWidth: '160px' }}>
              Data Retention (days)
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
                fontSize: 'var(--text-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card title="API Keys (Optional)">
        <div style={{ marginBottom: '12px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          API keys are stored in localStorage and sent to the local API server only.
          For permanent configuration, add them to your <code
            style={{ background: 'var(--bg-surface)', padding: '1px 4px', borderRadius: '3px', fontFamily: 'monospace' }}
          >.env</code> file and restart the worker.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {API_KEY_FIELDS.map((field) => (
            <div key={field.envKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {field.label}
                </label>
                <a
                  href={field.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '10px', color: 'var(--color-info)', textDecoration: 'none' }}
                >
                  Get key ↗
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
                  fontSize: 'var(--text-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{field.hint}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '7px 20px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-info)',
              background: 'rgba(137,180,250,0.12)',
              color: 'var(--color-info)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Save Keys
          </button>
          {saved && (
            <span style={{ fontSize: 'var(--text-xs)', color: '#49D17D' }}>
              ✓ Saved to localStorage
            </span>
          )}
        </div>
      </Card>

      {/* About */}
      <Card title="About">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <div><strong style={{ color: 'var(--text-primary)' }}>Armsrace Monitor</strong> — Localhost-only geopolitical intelligence and markets dashboard.</div>
          <div>All data is fetched directly from public sources. No analytics, no telemetry, no external CDN.</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            <strong>Disclaimer:</strong> Armsrace Monitor provides informational analytics and scenario modeling only.
            Predictions are probabilistic outputs, not guarantees or advice.
            Always verify critical decisions with primary sources.
          </div>
        </div>
      </Card>
    </div>
  );
}
