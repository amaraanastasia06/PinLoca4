import { Bookmark, MapPin, Navigation, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TRANSLATIONS, formatDistance, getPlaceCategoryLabel } from '../i18n';
import { AreaName, Language, Place, PlaceCategory, PlaceFilters } from '../types';
import { getDistanceKm } from '../utils/geo';

interface PlacesTabProps {
  lang: Language;
  places: Place[];
  favoritePlaceIds: string[];
  filters: PlaceFilters;
  onChangeFilters: (next: PlaceFilters) => void;
  onToggleFavorite: (placeId: string) => void;
  onOpenPlaceDetail: (place: Place) => void;
  onOpenSuggestPlace: () => void;
}

const PLACE_CATS: PlaceCategory[] = ['Gym', 'Yoga & Pilates', 'Kafe', 'Outdoor'];

export function PlacesTab({
  lang,
  places,
  favoritePlaceIds,
  filters,
  onChangeFilters,
  onToggleFavorite,
  onOpenPlaceDetail,
  onOpenSuggestPlace,
}: PlacesTabProps) {
  const t = TRANSLATIONS[lang];
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleRequestNearest = () => {
    if (filters.sortBy === 'nearest' && userCoords) {
      return;
    }
    if (!navigator.geolocation) {
      setGeoDenied(true);
      onChangeFilters({ ...filters, sortBy: 'alphabetical' });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoDenied(false);
        setLocating(false);
        onChangeFilters({ ...filters, sortBy: 'nearest' });
      },
      () => {
        setGeoDenied(true);
        setLocating(false);
        onChangeFilters({ ...filters, sortBy: 'alphabetical' });
      },
      { timeout: 6000 }
    );
  };

  const filteredPlaces = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const list = places.filter((p) => {
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.area !== 'all' && p.area !== filters.area) return false;
      if (filters.favoritesOnly && !favoritePlaceIds.includes(p.id)) return false;
      if (q) {
        const hay = `${p.name} ${p.area} ${p.category} ${p.tags.join(' ')} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (filters.sortBy === 'nearest' && userCoords) {
      return [...list].sort((a, b) => {
        const da =
          typeof a.lat === 'number' && typeof a.lng === 'number'
            ? getDistanceKm(userCoords.lat, userCoords.lng, a.lat, a.lng)
            : Number.MAX_SAFE_INTEGER;
        const db =
          typeof b.lat === 'number' && typeof b.lng === 'number'
            ? getDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng)
            : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    }

    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [places, filters, favoritePlaceIds, userCoords]);

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filters Header */}
      <div className="p-4 space-y-3 border-b border-gray-200/80 bg-white">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold text-[#1F2937]">{t.navPlaces}</h2>
          <button
            type="button"
            onClick={onOpenSuggestPlace}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#FF8A3D] hover:bg-[#e5772d] text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.suggestPlace}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChangeFilters({ ...filters, search: e.target.value })}
            placeholder={t.searchPlacesPlaceholder}
            className="w-full pl-10 pr-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-[#FAFAF7] text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D8A] focus:bg-white"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onChangeFilters({ ...filters, category: 'all' })}
            className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              filters.category === 'all'
                ? 'bg-[#1F2937] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
            }`}
          >
            {t.all}
          </button>
          {PLACE_CATS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                onChangeFilters({
                  ...filters,
                  category: filters.category === cat ? 'all' : cat,
                })
              }
              className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                filters.category === cat
                  ? 'bg-[#1F2937] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
              }`}
            >
              {getPlaceCategoryLabel(cat, lang)}
            </button>
          ))}
        </div>

        {/* Area + Sort + Favorites Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {(['all', 'Canggu', 'Ubud'] as Array<'all' | AreaName>).map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => onChangeFilters({ ...filters, area })}
                className={`px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.area === area
                    ? 'bg-[#0F9D8A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                }`}
              >
                {area === 'all' ? t.all : area}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                onChangeFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })
              }
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer ${
                filters.favoritesOnly
                  ? 'bg-[#FF8A3D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>{t.favoritesOnly}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRequestNearest}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer ${
                filters.sortBy === 'nearest' && userCoords
                  ? 'bg-[#1F2937] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>{locating ? '...' : t.sortNearest}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeFilters({ ...filters, sortBy: 'alphabetical' })}
              className={`px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer ${
                filters.sortBy === 'alphabetical' || !userCoords
                  ? 'bg-[#1F2937] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
              }`}
            >
              {t.sortAlpha}
            </button>
          </div>
        </div>

        {geoDenied && (
          <p className="text-[11px] text-amber-700 font-medium">{t.locationDeniedNote}</p>
        )}

        <p className="text-xs font-medium text-gray-500 tabular-nums">
          {t.resultsPlaces(filteredPlaces.length)}
        </p>
      </div>

      {/* Places List */}
      <div className="flex-1 overflow-y-auto pinloca-scroll p-4 space-y-3 pb-24 lg:pb-6">
        {filteredPlaces.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200/80 p-6 text-center space-y-2">
            <p className="text-base font-bold text-[#1F2937]">{t.emptyPlacesTitle}</p>
            <p className="text-xs text-gray-500">{t.emptyPlacesDesc}</p>
            <button
              type="button"
              onClick={onOpenSuggestPlace}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#0F9D8A] text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.suggestPlace}</span>
            </button>
          </div>
        ) : (
          filteredPlaces.map((place) => {
            const isFav = favoritePlaceIds.includes(place.id);
            const desc = lang === 'en' && place.descriptionEn ? place.descriptionEn : place.description;
            const tags = lang === 'en' && place.tagsEn ? place.tagsEn : place.tags;
            const distanceKm =
              userCoords && typeof place.lat === 'number' && typeof place.lng === 'number'
                ? getDistanceKm(userCoords.lat, userCoords.lng, place.lat, place.lng)
                : null;

            return (
              <article
                key={place.id}
                onClick={() => onOpenPlaceDetail(place)}
                className="rounded-2xl bg-white p-4 border border-gray-200/80 hover:border-[#0F9D8A] shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <span className="text-[#0F9D8A]">
                        {getPlaceCategoryLabel(place.category, lang)}
                      </span>
                      <span>·</span>
                      <span>{place.area}</span>
                      {distanceKm !== null && (
                        <>
                          <span>·</span>
                          <span className="text-[#1F2937] tabular-nums">
                            {formatDistance(distanceKm)}
                          </span>
                        </>
                      )}
                      {place.isUserSuggested && (
                        <>
                          <span>·</span>
                          <span className="text-[#FF8A3D]">{t.userSuggested}</span>
                        </>
                      )}
                      {place.isApproximate && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700">{t.approximateLocation}</span>
                        </>
                      )}
                    </div>

                    <h3 className="mt-1 text-base font-bold text-[#1F2937] truncate">
                      {place.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">{desc}</p>

                    {place.address && (
                      <p className="mt-1.5 text-[11px] text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{place.address}</span>
                      </p>
                    )}

                    {tags.length > 0 && (
                      <p className="mt-1.5 text-[11px] font-medium text-gray-400 truncate">
                        {tags.join(' · ')}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(place.id);
                    }}
                    aria-label={isFav ? t.savedPlace : t.savePlace}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      isFav
                        ? 'bg-[#FF8A3D]/12 text-[#FF8A3D]'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200/70'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </article>
            );
          })
        )}

        {/* Required Footer Note */}
        <p className="text-[11px] text-gray-500 text-center pt-3 pb-2 px-4">
          {t.placeFooterNote}
        </p>
      </div>
    </div>
  );
}
