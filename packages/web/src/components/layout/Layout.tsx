import React, { useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FloatingNav } from './FloatingNav.js';
import { ToastContainer } from '../ui/ToastContainer.js';
import { Toolbar } from '../ui/Toolbar.js';
import { HeatmapLayer } from '../map/HeatmapLayer.js';
import { MapLegend } from '../map/MapLegend.js';
import { MarkerPopup } from '../map/MarkerPopup.js';
import { useSignals } from '../../hooks/useSignals.js';
import { useSettings, MAP_STYLES } from '../../context/SettingsContext.js';
import { severityColor } from '../../styles/tokens.js';

const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/* Dynamically swap tile layer when mapStyle changes */
function TileSwapper() {
  const { settings } = useSettings();
  const style = MAP_STYLES[settings.mapStyle];
  return <TileLayer key={settings.mapStyle} url={style.url} attribution={TILE_ATTR} />;
}

export function Layout() {
  const { pathname } = useLocation();
  const isOverview = pathname === '/';
  const { settings } = useSettings();
  const signalsQuery = useSignals({ limit: 300 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signals: any[] = (signalsQuery.data as any)?.data ?? [];

  const geoEvents = useMemo(() =>
    signals
      .filter((s) => s.lat != null && s.lon != null)
      .map((s) => ({
        id: s.id,
        lat: s.lat as number,
        lon: s.lon as number,
        title: s.title as string,
        category: s.category as string,
        severity: s.severity as number,
        confidence: s.confidence as number,
        source: s.source_id as string | undefined,
        country: s.country_code as string | undefined,
        publishedAt: new Date(Number(s.published_at)).toISOString(),
        body: s.summary as string | undefined,
      })),
    [signals],
  );

  const heatPoints = useMemo(() =>
    geoEvents.map((e) => ({ lat: e.lat, lon: e.lon, intensity: e.severity / 100 })),
    [geoEvents],
  );

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* ── FULL-SCREEN MAP BACKGROUND ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapContainer
          center={[20, 10]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl
        >
          <TileSwapper />
          <ZoomControl position="bottomright" />

          {settings.showHeatmap && <HeatmapLayer points={heatPoints} />}

          {settings.showMarkers && geoEvents.map((event) => {
            const color = severityColor(event.severity);
            const radius = 3 + (event.severity / 100) * 7;
            return (
              <CircleMarker
                key={event.id}
                center={[event.lat, event.lon]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.65,
                  color,
                  weight: 1,
                  opacity: 0.8,
                }}
              >
                <Popup className="armsrace-popup" maxWidth={300} minWidth={220}>
                  <MarkerPopup data={event} />
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        <MapLegend showHeatmap={settings.showHeatmap} />
      </div>

      {/* ── FLOATING NAV ── */}
      <FloatingNav />

      {/* ── TOOLBAR (bottom-left) ── */}
      <Toolbar />

      {/* ── PAGE CONTENT (overlays map) ── */}
      {isOverview ? (
        <Outlet />
      ) : (
        <div className="content-panel fade-in">
          <div className="content-panel-inner">
            <Outlet />
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
