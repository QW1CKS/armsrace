import React, { useState } from 'react';
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

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
];

const DENSITY_OPTIONS: { value: UIDensity; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

const WIDGET_LABELS: Record<keyof WidgetVisibility, string> = {
  gii: 'Global Instability',
  marketStress: 'Market Stress',
  infraInfo: 'Infra / Info',
  movers: 'Market Movers',
  ticker: 'Alert Ticker',
  alerts: 'Alert Feed',
};

type Panel = 'map' | 'time' | 'display' | 'widgets' | null;

export function Toolbar() {
  const { settings, updateSettings, toggleWidget } = useSettings();
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  const toggle = (p: Panel) => setOpenPanel((prev) => (prev === p ? null : p));

  return (
    <div className="toolbar-wrap">
      {/* Popover panels */}
      {openPanel && (
        <div className="toolbar-popover fade-in">
          {openPanel === 'map' && (
            <>
              <div className="toolbar-popover-title">Map Style</div>
              <div className="toolbar-grid">
                {(Object.entries(MAP_STYLES) as [MapStyleKey, { label: string }][]).map(([key, { label }]) => (
                  <button
                    key={key}
                    className={`toolbar-option${settings.mapStyle === key ? ' active' : ''}`}
                    onClick={() => updateSettings({ mapStyle: key })}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="toolbar-divider" />
              <div className="toolbar-popover-title">Layers</div>
              <label className="toolbar-toggle">
                <input type="checkbox" checked={settings.showHeatmap} onChange={() => updateSettings({ showHeatmap: !settings.showHeatmap })} />
                <span>Heatmap</span>
              </label>
              <label className="toolbar-toggle">
                <input type="checkbox" checked={settings.showMarkers} onChange={() => updateSettings({ showMarkers: !settings.showMarkers })} />
                <span>Markers</span>
              </label>
            </>
          )}

          {openPanel === 'time' && (
            <>
              <div className="toolbar-popover-title">Time Window</div>
              <div className="toolbar-grid">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    className={`toolbar-option${settings.timeRange === t.value ? ' active' : ''}`}
                    onClick={() => updateSettings({ timeRange: t.value })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {openPanel === 'display' && (
            <>
              <div className="toolbar-popover-title">Accent Color</div>
              <div className="toolbar-color-row">
                {(Object.entries(ACCENT_COLORS) as [AccentKey, string][]).map(([key, hex]) => (
                  <button
                    key={key}
                    className={`toolbar-swatch${settings.accentColor === key ? ' active' : ''}`}
                    style={{ background: hex }}
                    onClick={() => updateSettings({ accentColor: key })}
                    title={key}
                  />
                ))}
              </div>

              <div className="toolbar-divider" />
              <div className="toolbar-popover-title">Density</div>
              <div className="toolbar-grid">
                {DENSITY_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    className={`toolbar-option${settings.density === d.value ? ' active' : ''}`}
                    onClick={() => updateSettings({ density: d.value })}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="toolbar-divider" />
              <div className="toolbar-popover-title">Panel Opacity</div>
              <div className="toolbar-slider-row">
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={Math.round(settings.panelOpacity * 100)}
                  onChange={(e) => updateSettings({ panelOpacity: Number(e.target.value) / 100 })}
                  className="toolbar-slider"
                />
                <span className="toolbar-slider-val">{Math.round(settings.panelOpacity * 100)}%</span>
              </div>
            </>
          )}

          {openPanel === 'widgets' && (
            <>
              <div className="toolbar-popover-title">Overview Widgets</div>
              {(Object.keys(WIDGET_LABELS) as (keyof WidgetVisibility)[]).map((key) => (
                <label key={key} className="toolbar-toggle">
                  <input type="checkbox" checked={settings.widgets[key]} onChange={() => toggleWidget(key)} />
                  <span>{WIDGET_LABELS[key]}</span>
                </label>
              ))}
            </>
          )}
        </div>
      )}

      {/* Toolbar buttons */}
      <div className="toolbar-bar">
        <button className={`toolbar-btn${openPanel === 'map' ? ' active' : ''}`} onClick={() => toggle('map')} title="Map & Layers">
          <span className="toolbar-btn-icon">🗺</span>
          <span className="toolbar-btn-label">Map</span>
        </button>
        <button className={`toolbar-btn${openPanel === 'time' ? ' active' : ''}`} onClick={() => toggle('time')} title="Time Window">
          <span className="toolbar-btn-icon">⏱</span>
          <span className="toolbar-btn-label">{settings.timeRange === 'all' ? 'All' : settings.timeRange}</span>
        </button>
        <button className={`toolbar-btn${openPanel === 'display' ? ' active' : ''}`} onClick={() => toggle('display')} title="Appearance">
          <span className="toolbar-btn-icon">🎨</span>
          <span className="toolbar-btn-label">Theme</span>
        </button>
        <button className={`toolbar-btn${openPanel === 'widgets' ? ' active' : ''}`} onClick={() => toggle('widgets')} title="Widget Visibility">
          <span className="toolbar-btn-icon">⬡</span>
          <span className="toolbar-btn-label">Widgets</span>
        </button>
      </div>
    </div>
  );
}
