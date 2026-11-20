import L from 'leaflet';
import 'leaflet.markercluster';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  CATEGORY_META,
  PLACE_CATEGORY_META,
  TRANSLATIONS,
  formatEventDate,
  formatRupiah,
  getCategoryLabel,
  getPlaceCategoryLabel,
  getTodayDateString,
} from '../i18n';
import {
  ActivityEvent,
  AreaName,
  Language,
  Place,
  PlaceCategory,
} from '../types';
import { AREA_CENTERS, BALI_OVERVIEW_CENTER } from '../utils/geo';

interface MapCanvasProps {
  lang: Language;
  events: ActivityEvent[];
  places: Place[];
  showEventsLayer: boolean;
  onToggleEventsLayer: () => void;
  showPlacesLayer: boolean;
  onTogglePlacesLayer: () => void;
  placeSubFilter: PlaceCategory | 'all';
  onChangePlaceSubFilter: (cat: PlaceCategory | 'all') => void;
  activeArea: AreaName | 'all';
  onSelectArea: (area: AreaName | 'all') => void;
  selectedPin:
    | { type: 'event'; item: ActivityEvent }
    | { type: 'place'; item: Place }
    | null;
  onSelectPin: (
    pin: { type: 'event'; item: ActivityEvent } | { type: 'place'; item: Place } | null
  ) => void;
  onOpenEventDetail: (event: ActivityEvent) => void;
  onOpenPlaceDetail: (place: Place) => void;
  geocodingRemaining: number;
  flyToTarget: { lat: number; lng: number; zoom?: number; nonce: number } | null;
}

const PLACE_CATEGORIES: PlaceCategory[] = ['Gym', 'Yoga & Pilates', 'Kafe', 'Outdoor'];

function getPlaceIconSvg(cat: PlaceCategory): string {
  switch (cat) {
    case 'Gym':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M6 4v16"/><path d="M18 4v16"/><path d="M3 8v8"/><path d="M21 8v8"/></svg>`;
    case 'Yoga & Pilates':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v7"/><path d="M7 11l5 2 5-2"/><path d="M8 20l4-6 4 6"/></svg>`;
    case 'Kafe':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`;
    case 'Outdoor':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
  }
}

export function MapCanvas({
  lang,
  events,
  places,
  showEventsLayer,
  onToggleEventsLayer,
  showPlacesLayer,
  onTogglePlacesLayer,
  placeSubFilter,
  onChangePlaceSubFilter,
  activeArea,
  onSelectArea,
  selectedPin,
  onSelectPin,
  onOpenEventDetail,
  onOpenPlaceDetail,
  geocodingRemaining,
  flyToTarget,
}: MapCanvasProps) {
  const t = TRANSLATIONS[lang];
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [BALI_OVERVIEW_CENTER.lat, BALI_OVERVIEW_CENTER.lng],
      zoom: BALI_OVERVIEW_CENTER.zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="width:38px;height:38px;border-radius:9999px;background:#0F9D8A;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 12px rgba(15,157,138,0.35);font-family:'Plus Jakarta Sans',sans-serif;">${count}</div>`,
          className: 'pinloca-cluster-icon',
          iconSize: L.point(38, 38),
        });
      },
    });

    map.addLayer(clusterGroup);
    map.on('click', () => {
      onSelectPin(null);
    });

    mapRef.current = map;
    clusterGroupRef.current = clusterGroup;

    // Handle container resize cleanly
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      clusterGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to area or target when changed
  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;
    mapRef.current.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom ?? 14, {
      duration: 0.75,
    });
  }, [flyToTarget]);

  // Sync markers onto cluster group
  useEffect(() => {
    const cluster = clusterGroupRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    const today = getTodayDateString();

    if (showEventsLayer) {
      events.forEach((evt) => {
        const meta = CATEGORY_META[evt.category];
        const isSelected = selectedPin?.type === 'event' && selectedPin.item.id === evt.id;
        const isToday = evt.date === today;

        const icon = L.divIcon({
          className: 'pinloca-custom-pin',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          html: `
            <div style="
              width:38px;
              height:38px;
              border-radius:9999px;
              background:${meta.color};
              border:${isSelected ? '3.5px solid #1F2937' : isToday ? '3px solid #FFF7ED' : '2.5px solid #FFFFFF'};
              box-shadow:${isSelected ? '0 0 0 4px rgba(15,157,138,0.28), 0 6px 14px rgba(0,0,0,0.28)' : '0 4px 10px rgba(0,0,0,0.22)'};
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:17px;
              transform:${isSelected ? 'scale(1.12)' : 'scale(1)'};
              transition:transform 0.15s ease;
              cursor:pointer;
            ">${meta.emoji}</div>
          `,
        });

        const marker = L.marker([evt.lat, evt.lng], { icon });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectPin({ type: 'event', item: evt });
        });
        cluster.addLayer(marker);
      });
    }

    if (showPlacesLayer) {
      const visiblePlaces = places.filter((p) => {
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return false;
        if (placeSubFilter !== 'all' && p.category !== placeSubFilter) return false;
        return true;
      });

      visiblePlaces.forEach((place) => {
        const meta = PLACE_CATEGORY_META[place.category];
        const isSelected = selectedPin?.type === 'place' && selectedPin.item.id === place.id;

        const icon = L.divIcon({
          className: 'pinloca-custom-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `
            <div style="
              width:28px;
              height:28px;
              border-radius:8px;
              background:${meta.color};
              border:${isSelected ? '2.5px solid #FF8A3D' : '2px solid #FFFFFF'};
              box-shadow:${isSelected ? '0 0 0 3px rgba(255,138,61,0.3), 0 4px 10px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.2)'};
              display:flex;
              align-items:center;
              justify-content:center;
              transform:${isSelected ? 'scale(1.14)' : 'scale(1)'};
              transition:transform 0.15s ease;
              cursor:pointer;
            ">${getPlaceIconSvg(place.category)}</div>
          `,
        });

        const marker = L.marker([place.lat!, place.lng!], { icon });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectPin({ type: 'place', item: place });
        });
        cluster.addLayer(marker);
      });
    }
  }, [events, places, showEventsLayer, showPlacesLayer, placeSubFilter, selectedPin, onSelectPin]);

  const handleFlyArea = (area: AreaName | 'all') => {
    onSelectArea(area);
    if (!mapRef.current) return;
    if (area === 'all') {
      mapRef.current.flyTo([BALI_OVERVIEW_CENTER.lat, BALI_OVERVIEW_CENTER.lng], BALI_OVERVIEW_CENTER.zoom, {
        duration: 0.7,
      });
    } else {
      const target = AREA_CENTERS[area];
      mapRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 0.7 });
    }
  };

  const today = getTodayDateString();

  return (
    <div className="relative w-full h-full">
      {/* Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Floating Controls: Area Switcher + Layer Toggles */}
      <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Layer Toggle Chips (Kegiatan / Tempat) */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-gray-200/80">
            <button
              type="button"
              onClick={onToggleEventsLayer}
              className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                showEventsLayer
                  ? 'bg-[#0F9D8A] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.layerEvents}
            </button>
            <button
              type="button"
              onClick={onTogglePlacesLayer}
              className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                showPlacesLayer
                  ? 'bg-[#1F2937] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.layerPlaces}
            </button>
          </div>

          {/* Area Switcher Chips (Canggu / Ubud) */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-gray-200/80">
            <button
              type="button"
              onClick={() => handleFlyArea('all')}
              className={`px-2.5 py-2 min-h-[38px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeArea === 'all'
                  ? 'bg-[#FF8A3D] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t.allAreas}
            >
              <LocateFixed className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
              Bali
            </button>
            {(['Canggu', 'Ubud'] as AreaName[]).map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => handleFlyArea(area)}
                className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activeArea === area
                    ? 'bg-[#FF8A3D] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-filter chips when Tempat layer is ON */}
        {showPlacesLayer && (
          <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onChangePlaceSubFilter('all')}
              className={`px-3 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold shadow-sm border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                placeSubFilter === 'all'
                  ? 'bg-[#1F2937] text-white border-[#1F2937]'
                  : 'bg-white/95 text-gray-700 border-gray-200 hover:bg-white'
              }`}
            >
              {t.all}
            </button>
            {PLACE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onChangePlaceSubFilter(placeSubFilter === cat ? 'all' : cat)}
                className={`px-3 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold shadow-sm border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  placeSubFilter === cat
                    ? 'bg-[#1F2937] text-white border-[#1F2937]'
                    : 'bg-white/95 text-gray-700 border-gray-200 hover:bg-white'
                }`}
              >
                {getPlaceCategoryLabel(cat, lang)}
              </button>
            ))}
          </div>
        )}

        {/* Non-blocking Geocoding Progress Indicator */}
        {geocodingRemaining > 0 && (
          <div className="pointer-events-none self-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-sm border border-gray-200 text-xs font-medium text-gray-700">
              <span className="w-3 h-3 border-2 border-[#0F9D8A] border-t-transparent rounded-full animate-spin" />
              <span>{t.geocodingPins(geocodingRemaining)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Preview Card when a Pin is Tapped */}
      {selectedPin && (
        <div className="absolute left-3 right-3 bottom-24 lg:bottom-5 lg:left-5 lg:right-auto lg:w-[360px] z-20">
          {selectedPin.type === 'event' ? (
            (() => {
              const evt = selectedPin.item;
              const meta = CATEGORY_META[evt.category];
              const spotsLeft = Math.max(0, evt.maxSpots - evt.attendees.length);
              const title = lang === 'en' && evt.titleEn ? evt.titleEn : evt.title;
              const isToday = evt.date === today;

              return (
                <div className="rounded-2xl bg-white p-3.5 shadow-xl border border-gray-200/90 flex gap-3 items-stretch">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    {evt.coverImage ? (
                      <img
                        src={evt.coverImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${evt.coverGradient || meta.gradient} flex items-center justify-center`}
                      >
                        <span className="text-2xl">{meta.emoji}</span>
                      </div>
                    )}
                    {isToday && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#FF8A3D] text-white text-[10px] font-bold">
                        {t.todayBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold" style={{ color: meta.color }}>
                          {getCategoryLabel(evt.category, lang)} · {evt.area}
                        </p>
                        <h4 className="text-sm font-bold text-[#1F2937] leading-snug line-clamp-2">
                          {title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5 tabular-nums">
                          {formatEventDate(evt.date, lang)} · {evt.startTime}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectPin(null)}
                        aria-label={t.close}
                        className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="text-xs tabular-nums">
                        <span className="font-bold text-[#0F9D8A]">
                          {formatRupiah(evt.price, lang)}
                        </span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className={spotsLeft === 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                          {spotsLeft === 0 ? t.full : t.spotsLeft(spotsLeft)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenEventDetail(evt)}
                        className="px-3 py-1.5 min-h-[34px] rounded-xl bg-[#0F9D8A] hover:bg-[#0C8574] text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {t.viewDetail}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const place = selectedPin.item;
              const desc = lang === 'en' && place.descriptionEn ? place.descriptionEn : place.description;
              return (
                <div className="rounded-2xl bg-white p-3.5 shadow-xl border border-gray-200/90">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-[#1F2937]" />
                        <span>{getPlaceCategoryLabel(place.category, lang)}</span>
                        <span>·</span>
                        <span>{place.area}</span>
                        {place.isApproximate && (
                          <>
                            <span>·</span>
                            <span className="text-[#FF8A3D]">{t.approximateLocation}</span>
                          </>
                        )}
                      </div>
                      <h4 className="mt-1 text-base font-bold text-[#1F2937] truncate">
                        {place.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectPin(null)}
                      aria-label={t.close}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenPlaceDetail(place)}
                      className="px-3.5 py-2 min-h-[36px] rounded-xl bg-[#1F2937] hover:bg-gray-800 text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {t.viewDetail}
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}
