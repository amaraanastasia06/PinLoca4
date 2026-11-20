import L from 'leaflet';
import { useEffect, useRef } from 'react';

interface MiniMapProps {
  lat: number;
  lng: number;
  color?: string;
  interactivePick?: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
  heightClass?: string;
}

export function MiniMap({
  lat,
  lng,
  color = '#0F9D8A',
  interactivePick = false,
  onPickLocation,
  heightClass = 'h-44',
}: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: interactivePick,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: 'pinloca-custom-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: `<div style="width:28px;height:28px;border-radius:9999px;background:${color};border:3px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.28);"></div>`,
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    markerRef.current = marker;
    mapRef.current = map;

    if (interactivePick && onPickLocation) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const nextLat = Number(e.latlng.lat.toFixed(6));
        const nextLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([nextLat, nextLng]);
        onPickLocation(nextLat, nextLng);
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true });
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${heightClass} rounded-2xl overflow-hidden border border-gray-200 z-0`}
    />
  );
}
