import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatmapLayer } from './HeatmapLayer.js';
import { MapControls } from './MapControls.js';
import { MapLegend } from './MapLegend.js';
import { MarkerPopup } from './MarkerPopup.js';
import { severityColor } from '../../styles/tokens.js';

export interface GeoMapEvent {
  id: string;
  lat: number;
  lon: number;
  title: string;
  category: string;
  severity: number;
  confidence: number;
  source?: string;
  country?: string;
  publishedAt: string;
  body?: string;
}

interface LayerState {
  markers: boolean;
  heatmap: boolean;
}

interface GeoMapProps {
  events: GeoMapEvent[];
  height?: string | number;
  initialZoom?: number;
  center?: [number, number];
  loading?: boolean;
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function GeoMap({
  events,
  height = 480,
  initialZoom = 3,
  center = [20, 10],
  loading = false,
}: GeoMapProps) {
  const [layers, setLayers] = useState<LayerState>({ markers: true, heatmap: true });

  const toggleLayer = useCallback((id: string) => {
    setLayers((prev) => ({ ...prev, [id]: !prev[id as keyof LayerState] }));
  }, []);

  const layerOptions = [
    { id: 'markers', label: 'SIG MARKERS', enabled: layers.markers, onToggle: toggleLayer },
    { id: 'heatmap', label: 'HEAT DENSITY', enabled: layers.heatmap, onToggle: toggleLayer },
  ];

  const heatmapPoints = events.map((e) => ({
    lat: e.lat,
    lon: e.lon,
    intensity: e.severity / 100,
  }));

  return (
    <div style={{
      position: 'relative',
      height,
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
    }} className="card-surface">
      {/* HUD corner label */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '12px',
        zIndex: 1000,
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: 'var(--color-cyan)',
        letterSpacing: '0.12em',
        textShadow: '0 0 6px rgba(0,212,255,0.4)',
        textTransform: 'uppercase',
      }}>
        ▸ GEO-INT THEATER · {events.length} SIGNALS
      </div>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2,4,8,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: 'var(--color-cyan)',
          textTransform: 'uppercase',
        }}>
          LOADING MAP DATA…
        </div>
      )}

      <MapContainer
        center={center}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%', background: '#11111b' }}
        zoomControl={false}
        attributionControl
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ZoomControl position="bottomright" />

        {layers.heatmap && <HeatmapLayer points={heatmapPoints} />}

        {layers.markers && events.map((event) => {
          const color = severityColor(event.severity);
          const radius = 4 + (event.severity / 100) * 8;
          return (
            <CircleMarker
              key={event.id}
              center={[event.lat, event.lon]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.75,
                color,
                weight: 1,
                opacity: 0.9,
              }}
            >
              <Popup
                className="armsrace-popup"
                maxWidth={300}
                minWidth={220}
              >
                <MarkerPopup data={event} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <MapControls layers={layerOptions} />
      <MapLegend showHeatmap={layers.heatmap} />
    </div>
  );
}
