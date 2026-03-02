import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, MAP_STYLES, ACCENT_COLORS, type MapStyleKey, type AccentKey, type UIDensity, type TimeRange } from '../../context/SettingsContext.js';

interface CommandItem {
  id: string;
  label: string;
  section: string;
  icon: string;
  action: () => void;
  keywords?: string;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(() => {
    const nav = (path: string, label: string, icon: string) => ({
      id: `nav-${path}`,
      label: `Go to ${label}`,
      section: 'Navigation',
      icon,
      action: () => { navigate(path); onClose(); },
      keywords: label.toLowerCase(),
    });

    const items: CommandItem[] = [
      nav('/', 'Overview', '⬡'),
      nav('/geopolitics', 'Geopolitics', '◈'),
      nav('/markets', 'Markets', '△'),
      nav('/infrastructure', 'Infrastructure', '⬢'),
      nav('/predictions', 'Forecast', '◎'),
      nav('/alerts', 'Alerts', '◻'),
      nav('/sources', 'Data Sources', '◉'),
      nav('/settings', 'Settings', '⚙'),
    ];

    // Map styles
    for (const [key, { label }] of Object.entries(MAP_STYLES)) {
      items.push({
        id: `map-${key}`,
        label: `Map: ${label}`,
        section: 'Map Style',
        icon: '🗺',
        action: () => { updateSettings({ mapStyle: key as MapStyleKey }); onClose(); },
        keywords: `map tile ${label.toLowerCase()}`,
      });
    }

    // Accent colors
    for (const key of Object.keys(ACCENT_COLORS)) {
      items.push({
        id: `accent-${key}`,
        label: `Accent: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
        section: 'Appearance',
        icon: '🎨',
        action: () => { updateSettings({ accentColor: key as AccentKey }); onClose(); },
        keywords: `color theme accent ${key}`,
      });
    }

    // Density
    for (const d of ['compact', 'comfortable', 'spacious'] as UIDensity[]) {
      items.push({
        id: `density-${d}`,
        label: `Density: ${d.charAt(0).toUpperCase() + d.slice(1)}`,
        section: 'Appearance',
        icon: '↕',
        action: () => { updateSettings({ density: d }); onClose(); },
        keywords: `density spacing ${d}`,
      });
    }

    // Time ranges
    for (const t of ['1h', '6h', '24h', '3d', '7d', '30d', 'all'] as TimeRange[]) {
      items.push({
        id: `time-${t}`,
        label: `Time Window: ${t === 'all' ? 'All Time' : t}`,
        section: 'Data',
        icon: '⏱',
        action: () => { updateSettings({ timeRange: t }); onClose(); },
        keywords: `time range window filter ${t}`,
      });
    }

    // Toggles
    items.push(
      {
        id: 'toggle-heatmap',
        label: `${settings.showHeatmap ? 'Hide' : 'Show'} Heatmap`,
        section: 'Map',
        icon: '🔥',
        action: () => { updateSettings({ showHeatmap: !settings.showHeatmap }); onClose(); },
        keywords: 'heatmap heat layer toggle',
      },
      {
        id: 'toggle-markers',
        label: `${settings.showMarkers ? 'Hide' : 'Show'} Map Markers`,
        section: 'Map',
        icon: '📍',
        action: () => { updateSettings({ showMarkers: !settings.showMarkers }); onClose(); },
        keywords: 'markers pins dots toggle',
      },
    );

    return items;
  }, [navigate, onClose, updateSettings, settings.showHeatmap, settings.showMarkers]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q) ||
      (c.keywords ?? '').includes(q)
    );
  }, [commands, query]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIndex, onClose]);

  // Keep selected index in range
  useEffect(() => {
    if (selectedIndex >= filtered.length) setSelectedIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, selectedIndex]);

  if (!open) return null;

  // Group by section
  const sections = new Map<string, CommandItem[]>();
  for (const item of filtered) {
    if (!sections.has(item.section)) sections.set(item.section, []);
    sections.get(item.section)!.push(item);
  }

  let flatIndex = 0;

  return (
    <div className="cmd-palette-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-palette-input-row">
          <span className="cmd-palette-search-icon">⌘</span>
          <input
            ref={inputRef}
            className="cmd-palette-input"
            placeholder="Search commands, pages, settings..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <kbd className="cmd-palette-kbd">ESC</kbd>
        </div>

        <div className="cmd-palette-list">
          {filtered.length === 0 && (
            <div className="cmd-palette-empty">No matching commands</div>
          )}
          {Array.from(sections.entries()).map(([section, items]) => (
            <div key={section}>
              <div className="cmd-palette-section">{section}</div>
              {items.map((item) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={item.id}
                    className={`cmd-palette-item${idx === selectedIndex ? ' selected' : ''}`}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="cmd-palette-item-icon">{item.icon}</span>
                    <span className="cmd-palette-item-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
