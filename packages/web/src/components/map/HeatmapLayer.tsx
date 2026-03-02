import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapPoint {
  lat: number;
  lon: number;
  intensity?: number; // 0.0-1.0
}

interface HeatmapLayerProps {
  points: HeatmapPoint[];
  radius?: number;
  blur?: number;
  maxZoom?: number;
}

export function HeatmapLayer({ points, radius = 20, blur = 15, maxZoom = 10 }: HeatmapLayerProps) {
  const map = useMap();
  const heatRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (!heatRef.current) {
      heatRef.current = L.heatLayer([], {
        radius,
        blur,
        maxZoom,
        gradient: {
          0.0: '#49D17D',
          0.5: '#F5B84B',
          1.0: '#FF5D5D',
        },
        minOpacity: 0.3,
      }).addTo(map);
    }

    const latlngs: Array<[number, number, number?]> = points.map((p) => [
      p.lat,
      p.lon,
      p.intensity ?? 0.5,
    ]);

    heatRef.current.setLatLngs(latlngs);

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update points without recreating the layer
  useEffect(() => {
    if (heatRef.current) {
      const latlngs: Array<[number, number, number?]> = points.map((p) => [
        p.lat,
        p.lon,
        p.intensity ?? 0.5,
      ]);
      heatRef.current.setLatLngs(latlngs).redraw();
    }
  }, [points]);

  return null;
}
