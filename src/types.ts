export type Language = 'id' | 'en';

export type AreaName = 'Canggu' | 'Ubud';

export type EventCategory =
  | 'Running'
  | 'Yoga'
  | 'Hiking'
  | 'Workshop'
  | 'Sports'
  | 'Other';

export type EventLevel = 'Pemula' | 'Menengah' | 'Lanjutan';

export type TimeOfDay = 'Pagi' | 'Siang' | 'Sore/Malam';

export type PlaceCategory = 'Gym' | 'Yoga & Pilates' | 'Kafe' | 'Outdoor';

export type TravelMode = 'driving' | 'walking';

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface Attendee {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm 24h
  endTime: string; // HH:mm 24h
  area: AreaName;
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string; // If linked to a Place, directions use place's name-based Google Maps link
  price: number; // 0 = Gratis
  maxSpots: number;
  attendees: Attendee[];
  level: EventLevel;
  touristFriendly: boolean;
  whatToBring: string;
  whatToBringEn?: string;
  hostId: string;
  hostName: string;
  hostRating: number;
  hostVerified: boolean;
  coverImage?: string; // Data URL if uploaded by user
  coverGradient: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  area: AreaName;
  address?: string;
  tags: string[];
  tagsEn?: string[];
  description: string;
  descriptionEn?: string;
  lat?: number;
  lng?: number;
  isApproximate?: boolean;
  isUserSuggested?: boolean;
}

export interface CachedPlaceCoords {
  lat: number;
  lng: number;
  isApproximate: boolean;
  cachedAt: number;
}

export type DateFilterOption = 'all' | 'today' | 'tomorrow' | 'week' | 'custom';
export type PriceFilterOption = 'all' | 'free' | 'paid';

export interface EventFilters {
  category: EventCategory | 'all';
  dateOption: DateFilterOption;
  customDate: string;
  timeOfDay: TimeOfDay | 'all';
  price: PriceFilterOption;
  level: EventLevel | 'all';
  touristFriendlyOnly: boolean;
  area: AreaName | 'all';
}

export interface PlaceFilters {
  search: string;
  category: PlaceCategory | 'all';
  area: AreaName | 'all';
  sortBy: 'nearest' | 'alphabetical';
  favoritesOnly: boolean;
}
