import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Quake {
  id: string;
  time: string;
  magnitude: number;
  maxIntensity: string;
  hypocenter: string;
  lat: number;
  lng: number;
}

const EarthquakeMap: React.FC<{ quakes: Quake[] }> = ({ quakes }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [137.7278, 38.3606], // Center of Japan
      zoom: 4.5,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(m => m.remove());

    quakes.forEach(quake => {
      const el = document.createElement('div');
      el.className = 'quake-marker';
      const size = Math.max(20, quake.magnitude * 10);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = getIntensityColor(quake.maxIntensity);
      el.style.borderRadius = '50%';
      el.style.opacity = '0.6';
      el.style.boxShadow = `0 0 20px ${getIntensityColor(quake.maxIntensity)}`;
      el.className = 'animate-pulse';

      new mapboxgl.Marker(el)
        .setLngLat([quake.lng, quake.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${quake.hypocenter}</h3><p>M${quake.magnitude} / 震度${quake.maxIntensity}</p>`))
        .addTo(map.current!);
    });
  }, [quakes]);

  const getIntensityColor = (intensity: string) => {
    if (intensity.includes('7')) return '#ff0000';
    if (intensity.includes('6')) return '#ff4500';
    if (intensity.includes('5')) return '#ff8c00';
    if (intensity.includes('4')) return '#ffd700';
    return '#38bdf8';
  };

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default EarthquakeMap;
