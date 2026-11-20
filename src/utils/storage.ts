import { ActivityEvent, CachedPlaceCoords, Language, Place, User } from '../types';

const KEYS = {
  USER: 'pinloca_user_v1',
  EVENTS: 'pinloca_events_v1',
  SUGGESTED_PLACES: 'pinloca_suggested_places_v1',
  FAVORITE_PLACES: 'pinloca_favorite_places_v1',
  PLACE_COORDS: 'pinloca_place_coords_cache_v1',
  LANG: 'pinloca_lang_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadUser(): User | null {
  return safeGet<User | null>(KEYS.USER, null);
}

export function saveUser(user: User | null): void {
  if (!user) {
    try {
      localStorage.removeItem(KEYS.USER);
    } catch {
      // ignore
    }
    return;
  }
  safeSet(KEYS.USER, user);
}

export function loadLanguage(): Language {
  const val = safeGet<string>(KEYS.LANG, 'id');
  return val === 'en' ? 'en' : 'id';
}

export function saveLanguage(lang: Language): void {
  safeSet(KEYS.LANG, lang);
}

export function loadEvents(seedEvents: ActivityEvent[]): ActivityEvent[] {
  const stored = safeGet<ActivityEvent[] | null>(KEYS.EVENTS, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  safeSet(KEYS.EVENTS, seedEvents);
  return seedEvents;
}

export function saveEvents(events: ActivityEvent[]): void {
  safeSet(KEYS.EVENTS, events);
}

export function loadSuggestedPlaces(): Place[] {
  return safeGet<Place[]>(KEYS.SUGGESTED_PLACES, []);
}

export function saveSuggestedPlaces(places: Place[]): void {
  safeSet(KEYS.SUGGESTED_PLACES, places);
}

export function loadFavoritePlaceIds(): string[] {
  return safeGet<string[]>(KEYS.FAVORITE_PLACES, []);
}

export function saveFavoritePlaceIds(ids: string[]): void {
  safeSet(KEYS.FAVORITE_PLACES, ids);
}

export function loadPlaceCoordsCache(): Record<string, CachedPlaceCoords> {
  return safeGet<Record<string, CachedPlaceCoords>>(KEYS.PLACE_COORDS, {});
}

export function savePlaceCoordsCache(cache: Record<string, CachedPlaceCoords>): void {
  safeSet(KEYS.PLACE_COORDS, cache);
}
