import { ActivityEvent, AreaName, CachedPlaceCoords, Place, TravelMode } from '../types';
import { loadPlaceCoordsCache, savePlaceCoordsCache } from './storage';

export const AREA_CENTERS: Record<AreaName, { lat: number; lng: number; zoom: number }> = {
  Canggu: { lat: -8.65, lng: 115.1385, zoom: 14 },
  Ubud: { lat: -8.5069, lng: 115.2625, zoom: 14 },
};

export const BALI_OVERVIEW_CENTER = { lat: -8.58, lng: 115.2, zoom: 12 };

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinBaliBounds(lat: number, lng: number): boolean {
  return lat >= -8.9 && lat <= -8.05 && lng >= 114.4 && lng <= 115.75;
}

export function getAreaFallbackCoords(area: AreaName, seedKey: string): { lat: number; lng: number } {
  const base = AREA_CENTERS[area];
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) | 0;
  }
  const angle = ((Math.abs(hash) % 360) * Math.PI) / 180;
  const radius = 0.0018 + (Math.abs(hash >> 4) % 10) * 0.00025; // ~200m to ~450m offset
  return {
    lat: Number((base.lat + Math.sin(angle) * radius).toFixed(6)),
    lng: Number((base.lng + Math.cos(angle) * radius).toFixed(6)),
  };
}

// Google Maps links per exact spec
export function getGoogleMapsPlaceSearchUrl(place: Pick<Place, 'name' | 'area'>): string {
  const q = encodeURIComponent(`${place.name}, ${place.area}, Bali`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function getGoogleMapsPlaceDirUrl(
  place: Pick<Place, 'name' | 'area'>,
  mode: TravelMode
): string {
  const dest = encodeURIComponent(`${place.name}, ${place.area}, Bali`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode}`;
}

export function getGoogleMapsEventDirUrl(
  event: ActivityEvent,
  linkedPlace: Place | undefined,
  mode: TravelMode
): string {
  if (event.placeId && linkedPlace) {
    return getGoogleMapsPlaceDirUrl(linkedPlace, mode);
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}&travelmode=${mode}`;
}

// Sequential rate-limited Nominatim geocoder (max 1 req/sec, cached in localStorage)
export async function geocodeMissingPlacesQueue(
  places: Place[],
  onPlaceResolved: (placeId: string, coords: CachedPlaceCoords) => void,
  onProgress: (remaining: number) => void,
  signal: AbortSignal
): Promise<void> {
  const cache = loadPlaceCoordsCache();
  const toFetch: Place[] = [];

  for (const p of places) {
    if (typeof p.lat === 'number' && typeof p.lng === 'number') {
      continue;
    }
    const cached = cache[p.id];
    if (cached) {
      onPlaceResolved(p.id, cached);
    } else {
      toFetch.push(p);
    }
  }

  if (toFetch.length === 0) {
    onProgress(0);
    return;
  }

  onProgress(toFetch.length);

  for (let i = 0; i < toFetch.length; i++) {
    if (signal.aborted) return;
    const place = toFetch[i];

    let resolved: CachedPlaceCoords | null = null;

    try {
      const query = encodeURIComponent(`${place.name}, ${place.area}, Bali`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lng) && isWithinBaliBounds(lat, lng)) {
            resolved = {
              lat,
              lng,
              isApproximate: false,
              cachedAt: Date.now(),
            };
          }
        }
      }
    } catch {
      // Network or timeout failure falls back cleanly below
    }

    if (!resolved) {
      const fallback = getAreaFallbackCoords(place.area, place.id + place.name);
      resolved = {
        lat: fallback.lat,
        lng: fallback.lng,
        isApproximate: true,
        cachedAt: Date.now(),
      };
    }

    cache[place.id] = resolved;
    savePlaceCoordsCache(cache);
    onPlaceResolved(place.id, resolved);
    onProgress(toFetch.length - i - 1);

    // Respect Nominatim rate limit: max 1 request per second
    if (i < toFetch.length - 1 && !signal.aborted) {
      await new Promise((r) => setTimeout(r, 1100));
    }
  }
}
