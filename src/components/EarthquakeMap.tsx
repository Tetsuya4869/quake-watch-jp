import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getIntensityColor } from '../utils/getIntensityColor';
import { escapeHtml } from '../utils/escapeHtml';
import type { Quake } from '../types/quake';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const EarthquakeMap: React.FC<{ quakes: Quake[] }> = ({ quakes }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [137.7278, 38.3606], // Center of Japan
      zoom: 4.5,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap) return;

    // 既存マーカーをMapboxのAPI経由で破棄（直接DOM操作はしない）
    markers.current.forEach(marker => marker.remove());

    markers.current = quakes.map(quake => {
      const el = document.createElement('div');
      el.className = 'quake-marker animate-pulse';
      const size = Math.max(20, quake.magnitude * 10);
      const color = getIntensityColor(quake.maxIntensity);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = color;
      el.style.borderRadius = '50%';
      el.style.opacity = '0.6';
      el.style.boxShadow = `0 0 20px ${color}`;
      el.setAttribute('role', 'img');
      el.setAttribute(
        'aria-label',
        `${quake.hypocenter} マグニチュード${quake.magnitude} 震度${quake.maxIntensity}`
      );

      return new mapboxgl.Marker(el)
        .setLngLat([quake.lng, quake.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(
            `<h3>${escapeHtml(quake.hypocenter)}</h3><p>M${quake.magnitude} / 震度${escapeHtml(quake.maxIntensity)}</p>`
          ))
        .addTo(currentMap);
    });
  }, [quakes]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default EarthquakeMap;
