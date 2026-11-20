import {
  ArrowLeft,
  Bookmark,
  CalendarPlus,
  Car,
  ExternalLink,
  Footprints,
  Info,
  MapPin,
  Navigation,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CATEGORY_META,
  TRANSLATIONS,
  formatDistance,
  formatEventDate,
  formatRupiah,
  getPlaceCategoryLabel,
} from '../i18n';
import { ActivityEvent, Language, Place, TravelMode } from '../types';
import {
  getDistanceKm,
  getGoogleMapsPlaceDirUrl,
  getGoogleMapsPlaceSearchUrl,
} from '../utils/geo';

interface PlaceDetailSheetProps {
  place: Place;
  lang: Language;
  events: ActivityEvent[];
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
  onCreateEventHere: (place: Place) => void;
  onOpenEvent: (event: ActivityEvent) => void;
  onClose: () => void;
}

export function PlaceDetailSheet({
  place,
  lang,
  events,
  isFavorite,
  onToggleFavorite,
  onCreateEventHere,
  onOpenEvent,
  onClose,
}: PlaceDetailSheetProps) {
  const t = TRANSLATIONS[lang];
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');

  const description =
    lang === 'en' && place.descriptionEn ? place.descriptionEn : place.description;
  const tags = lang === 'en' && place.tagsEn ? place.tagsEn : place.tags;

  const searchUrl = getGoogleMapsPlaceSearchUrl(place);
  const dirUrl = getGoogleMapsPlaceDirUrl(place, travelMode);

  // Events within 2 km
  const nearbyEvents = useMemo(() => {
    if (typeof place.lat !== 'number' || typeof place.lng !== 'number') return [];
    return events
      .map((evt) => ({
        event: evt,
        distanceKm: getDistanceKm(place.lat!, place.lng!, evt.lat, evt.lng),
      }))
      .filter((item) => item.distanceKm <= 2)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [events, place.lat, place.lng]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end lg:items-center justify-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={place.name}
      onClick={onClose}
    >
      <div
        className="w-full lg:max-w-xl max-h-[90vh] bg-[#FAFAF7] rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-200/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2 -ml-1 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pinloca-scroll p-4 sm:p-6 space-y-5">
          {/* Place Header Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-gray-500">
              <span className="text-[#0F9D8A]">{getPlaceCategoryLabel(place.category, lang)}</span>
              <span>·</span>
              <span>{place.area}</span>
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

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] leading-snug">
              {place.name}
            </h2>

            {place.address && (
              <p className="text-xs text-gray-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>{place.address}</span>
              </p>
            )}

            <p className="text-[15px] text-gray-700 leading-relaxed">{description}</p>

            {tags.length > 0 && (
              <p className="text-xs font-medium text-gray-500 pt-1">
                {tags.join(' · ')}
              </p>
            )}

            {/* Required note instead of opening hours/prices/ratings/phone */}
            <p className="pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0F9D8A] shrink-0" />
              <span>{t.placeHoursNote}</span>
            </p>
          </div>

          {/* Google Maps & Actions */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/80 space-y-3">
            {/* Travel mode selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500">{t.travelMode}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTravelMode('driving')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    travelMode === 'driving'
                      ? 'bg-[#1F2937] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{t.modeDriving}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTravelMode('walking')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    travelMode === 'walking'
                      ? 'bg-[#1F2937] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{t.modeWalking}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#1F2937] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#0F9D8A]" />
                <span>{t.openInGoogleMaps}</span>
              </a>

              <a
                href={dirUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 rounded-xl bg-[#0F9D8A] hover:bg-[#0C8574] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.directions}</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onToggleFavorite(place.id)}
                className={`min-h-[44px] px-3 rounded-xl border text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isFavorite
                    ? 'border-[#FF8A3D] bg-[#FF8A3D]/10 text-[#FF8A3D]'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-[#1F2937]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? t.savedPlace : t.savePlace}</span>
              </button>

              <button
                type="button"
                onClick={() => onCreateEventHere(place)}
                className="min-h-[44px] px-3 rounded-xl border border-[#0F9D8A]/30 bg-[#0F9D8A]/8 hover:bg-[#0F9D8A]/15 text-[#0F9D8A] text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.createEventHere}</span>
              </button>
            </div>
          </div>

          {/* Nearby Activities within 2 km */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#1F2937]">{t.nearbyEvents}</h3>
            {nearbyEvents.length === 0 ? (
              <p className="text-xs text-gray-500 bg-white rounded-2xl p-3.5 border border-gray-200/80">
                {t.nearbyEventsEmpty}
              </p>
            ) : (
              <div className="space-y-2">
                {nearbyEvents.map(({ event, distanceKm }) => {
                  const meta = CATEGORY_META[event.category];
                  const evtTitle = lang === 'en' && event.titleEn ? event.titleEn : event.title;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onOpenEvent(event)}
                      className="w-full text-left bg-white hover:border-[#0F9D8A] rounded-2xl p-3 border border-gray-200/80 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <span
                        style={{ backgroundColor: meta.color }}
                        className="w-10 h-10 rounded-full text-white flex items-center justify-center text-lg shrink-0"
                      >
                        {meta.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{evtTitle}</p>
                        <p className="text-xs text-gray-500 tabular-nums truncate">
                          {formatEventDate(event.date, lang)} · {event.startTime} ·{' '}
                          {formatDistance(distanceKm)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#0F9D8A] shrink-0 tabular-nums">
                        {formatRupiah(event.price, lang)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Required disclaimer footer */}
          <p className="text-[11px] text-gray-500 text-center pt-2 pb-1">
            {t.placeFooterNote}
          </p>
        </div>
      </div>
    </div>
  );
}
