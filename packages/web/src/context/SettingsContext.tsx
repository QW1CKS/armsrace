import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ── Map tile style presets ─────────────────────────────────── */
export const MAP_STYLES = {
  dark:      { label: 'Dark',      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  light:     { label: 'Light',     url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  satellite: { label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  terrain:   { label: 'Terrain',   url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  voyager:   { label: 'Voyager',   url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png' },
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export const ACCENT_COLORS = {
  blue:   '#38bdf8',
  purple: '#a78bfa',
  cyan:   '#22d3ee',
  green:  '#4ade80',
  amber:  '#fbbf24',
  rose:   '#fb7185',
} as const;

export type AccentKey = keyof typeof ACCENT_COLORS;

export type UIDensity = 'compact' | 'comfortable' | 'spacious';
export type TimeRange = '1h' | '6h' | '24h' | '3d' | '7d' | '30d' | 'all';

export interface WidgetVisibility {
  gii: boolean;
  marketStress: boolean;
  infraInfo: boolean;
  movers: boolean;
  ticker: boolean;
  alerts: boolean;
}

interface Settings {
  openBrowserOnStart: boolean;
  desktopNotifications: boolean;
  dataRetentionDays: number;
  apiKeys: Record<string, string>;
  /* ── NEW UI preferences ─────────────────── */
  mapStyle: MapStyleKey;
  accentColor: AccentKey;
  density: UIDensity;
  panelOpacity: number;       // 0.5 – 1.0
  showHeatmap: boolean;
  showMarkers: boolean;
  timeRange: TimeRange;
  widgets: WidgetVisibility;
  sidebarCollapsed: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  setApiKey: (key: string, value: string) => void;
  toggleWidget: (key: keyof WidgetVisibility) => void;
}

const DEFAULT_WIDGETS: WidgetVisibility = {
  gii: true,
  marketStress: true,
  infraInfo: true,
  movers: true,
  ticker: true,
  alerts: true,
};

const DEFAULT_SETTINGS: Settings = {
  openBrowserOnStart: true,
  desktopNotifications: false,
  dataRetentionDays: 30,
  apiKeys: {},
  mapStyle: 'dark',
  accentColor: 'blue',
  density: 'comfortable',
  panelOpacity: 0.92,
  showHeatmap: true,
  showMarkers: true,
  timeRange: '24h',
  widgets: DEFAULT_WIDGETS,
  sidebarCollapsed: false,
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  setApiKey: () => {},
  toggleWidget: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('armsrace-settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored), widgets: { ...DEFAULT_WIDGETS, ...(JSON.parse(stored).widgets ?? {}) } } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('armsrace-settings', JSON.stringify(settings));
  }, [settings]);

  /* Apply accent color as CSS custom property on :root */
  useEffect(() => {
    const root = document.documentElement;
    const accent = ACCENT_COLORS[settings.accentColor] ?? ACCENT_COLORS.blue;
    root.style.setProperty('--color-info', accent);
    root.style.setProperty('--border-active', `${accent}4d`);     // 30% alpha
    root.style.setProperty('--bg-active', `${accent}14`);         // 8% alpha
    root.style.setProperty('--shadow-glow', `0 0 20px ${accent}14`);
  }, [settings.accentColor]);

  /* Apply density spacing */
  useEffect(() => {
    const root = document.documentElement;
    const scales: Record<UIDensity, { gap: string; pad: string; fontSize: string }> = {
      compact:     { gap: '6px',  pad: '8px 10px', fontSize: '11px' },
      comfortable: { gap: '10px', pad: '12px 14px', fontSize: '12px' },
      spacious:    { gap: '14px', pad: '16px 18px', fontSize: '13px' },
    };
    const s = scales[settings.density];
    root.style.setProperty('--density-gap', s.gap);
    root.style.setProperty('--density-pad', s.pad);
    root.style.setProperty('--density-font', s.fontSize);
  }, [settings.density]);

  /* Apply panel opacity */
  useEffect(() => {
    const root = document.documentElement;
    const o = settings.panelOpacity;
    root.style.setProperty('--bg-glass', `rgba(10, 14, 23, ${(o * 0.78).toFixed(2)})`);
    root.style.setProperty('--bg-glass-heavy', `rgba(10, 14, 23, ${o.toFixed(2)})`);
  }, [settings.panelOpacity]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const setApiKey = useCallback((key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [key]: value },
    }));
  }, []);

  const toggleWidget = useCallback((key: keyof WidgetVisibility) => {
    setSettings((prev) => ({
      ...prev,
      widgets: { ...prev.widgets, [key]: !prev.widgets[key] },
    }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setApiKey, toggleWidget }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
