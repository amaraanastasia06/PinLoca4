import {
  ArrowLeft,
  Backpack,
  BadgeCheck,
  Calendar,
  Car,
  Check,
  Footprints,
  MapPin,
  Navigation,
  Share2,
  Star,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CATEGORY_META,
  TRANSLATIONS,
  formatDistance,
  formatEventDate,
  formatRupiah,
  getCategoryLabel,
  getLevelLabel,
  getPlaceCategoryLabel,
  getTodayDateString,
} from '../i18n';
import { ActivityEvent, Language, Place, TravelMode, User } from '../types';
import { getDistanceKm, getGoogleMapsEventDirUrl } from '../utils/geo';
import { MiniMap } from './MiniMap';

interface EventDetailSheetProps {
  event: ActivityEvent;
  lang: Language;
  places: Place[];
  currentUser: User | null;
  onClose: () => void;
  onToggleJoin: (event: ActivityEvent) => void;
  onOpenPlace: (place: Place) => void;
  onShare: (event: ActivityEvent) => void;
}

export function EventDetailSheet({
  event,
  lang,
  places,
  currentUser,
  onClose,
  onToggleJoin,
  onOpenPlace,
  onShare,
}: EventDetailSheetProps) {
  const t = TRANSLATIONS[lang];
  const meta = CATEGORY_META[event.category];
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');

  const today = getTodayDateString();
  const isToday = event.date === today;
  const spotsLeft = Math.max(0, event.maxSpots - event.attendees.length);
  const isFull = spotsLeft === 0;
  const isJoined = currentUser
    ? event.attendees.some((a) => a.id === currentUser.id)
    : false;

  const title = lang === 'en' && event.titleEn ? event.titleEn : event.title;
  const description =
    lang === 'en' && event.descriptionEn ? event.descriptionEn : event.description;
  const whatToBring =
    lang === 'en' && event.whatToBringEn ? event.whatToBringEn : event.whatToBring;

  const linkedPlace = useMemo(
    () => places.find((p) => p.id === event.placeId),
    [places, event.placeId]
  );

  const directionsUrl = getGoogleMapsEventDirUrl(event, linkedPlace, travelMode);

  // 3 nearest places within 3 km
  const nearbyPlaces = useMemo(() => {
    return places
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number' && p.id !== event.placeId)
      .map((p) => ({
        place: p,
        distanceKm: getDistanceKm(event.lat, event.lng, p.lat!, p.lng!),
      }))
      .filter((item) => item.distanceKm <= 3)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [places, event.lat, event.lng, event.placeId]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end lg:items-center justify-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full lg:max-w-2xl max-h-[92vh] bg-[#FAFAF7] rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-200/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2 -ml-1 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onShare(event)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-[#1F2937] cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.share}</span>
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
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pinloca-scroll p-4 sm:p-6 space-y-5">
          {/* Cover */}
          <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-sm">
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${event.coverGradient || meta.gradient} flex items-center justify-center`}
              >
                <span className="text-6xl select-none" aria-hidden="true">
                  {meta.emoji}
                </span>
              </div>
            )}

            {isToday && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#FF8A3D] text-white text-xs font-bold shadow-sm">
                {t.todayBadge}
              </span>
            )}
          </div>

          {/* Title + Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-gray-500">
              <span style={{ color: meta.color }}>{getCategoryLabel(event.category, lang)}</span>
              <span>·</span>
              <span>{getLevelLabel(event.level, lang)}</span>
              <span>·</span>
              <span>{event.area}</span>
              {event.touristFriendly && (
                <>
                  <span>·</span>
                  <span className="text-[#0F9D8A]">{t.touristFriendly}</span>
                </>
              )}
            </div>

            <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[#1F2937] leading-snug">
              {title}
            </h2>

            {/* Host Row */}
            <div className="mt-3 flex items-center justify-between gap-3 bg-white rounded-2xl p-3.5 border border-gray-200/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#0F9D8A]/15 text-[#0F9D8A] font-bold text-sm flex items-center justify-center shrink-0">
                  {event.hostName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#1F2937] truncate">
                      {event.hostName}
                    </span>
                    {event.hostVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#0F9D8A]">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {t.verified}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-[#FF8A3D] text-[#FF8A3D]" />
                    <span className="font-semibold text-[#1F2937]">
                      {event.hostRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <p className="text-lg font-extrabold text-[#0F9D8A]">
                  {formatRupiah(event.price, lang)}
                </p>
                <p className={`text-xs font-semibold ${isFull ? 'text-red-600' : 'text-gray-500'}`}>
                  {isFull ? t.full : t.spotsLeft(spotsLeft)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[15px] leading-relaxed text-gray-700">{description}</p>

          {/* Key Details Grid */}
          <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100">
            <div className="p-3.5 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#0F9D8A] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1F2937] tabular-nums">
                  {formatEventDate(event.date, lang)} · {event.startTime} – {event.endTime}
                </p>
                {event.price > 0 && (
                  <p className="mt-1 text-xs font-medium text-[#0F9D8A]">
                    {t.cancellationPaid}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <Backpack className="w-5 h-5 text-[#FF8A3D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-500">{t.whatToBring}</p>
                <p className="text-sm text-[#1F2937] mt-0.5">{whatToBring}</p>
              </div>
            </div>

            {/* Attendees */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Users className="w-5 h-5 text-[#0F9D8A] shrink-0" />
                <div className="flex items-center -space-x-2">
                  {event.attendees.slice(0, 6).map((att) => (
                    <span
                      key={att.id}
                      title={att.name}
                      style={{ backgroundColor: att.color }}
                      className="w-8 h-8 rounded-full border-2 border-white text-white text-[11px] font-bold flex items-center justify-center"
                    >
                      {att.initials}
                    </span>
                  ))}
                  {event.attendees.length > 6 && (
                    <span className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-gray-700 text-[11px] font-bold flex items-center justify-center">
                      +{event.attendees.length - 6}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-600 tabular-nums shrink-0">
                {t.attendeesCount(event.attendees.length, event.maxSpots)}
              </span>
            </div>
          </div>

          {/* Location + MiniMap + Travel Mode Directions */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">{t.location}</p>
                <h3 className="text-base font-bold text-[#1F2937] mt-0.5">
                  {event.locationName}
                </h3>
                {event.address && (
                  <p className="text-xs text-gray-600 mt-0.5">{event.address}</p>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-500 shrink-0">{event.area}</span>
            </div>

            <MiniMap lat={event.lat} lng={event.lng} color={meta.color} heightClass="h-44" />

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Travel mode selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-500 mr-1">{t.travelMode}:</span>
                <button
                  type="button"
                  onClick={() => setTravelMode('driving')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    travelMode === 'walking'
                      ? 'bg-[#1F2937] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{t.modeWalking}</span>
                </button>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[42px] rounded-xl border border-[#0F9D8A] text-[#0F9D8A] hover:bg-[#0F9D8A]/5 text-xs font-bold transition-colors whitespace-nowrap"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.directions}</span>
              </a>
            </div>
          </div>

          {/* Tempat di sekitar (3 nearest places within 3 km) */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#1F2937]">{t.nearbyPlaces}</h3>
            {nearbyPlaces.length === 0 ? (
              <p className="text-xs text-gray-500 bg-white rounded-2xl p-3.5 border border-gray-200/80">
                {t.nearbyPlacesEmpty}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {nearbyPlaces.map(({ place, distanceKm }) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => onOpenPlace(place)}
                    className="text-left bg-white hover:border-[#0F9D8A] rounded-2xl p-3 border border-gray-200/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-gray-500">
                      <span>{getPlaceCategoryLabel(place.category, lang)}</span>
                      <span className="text-[#0F9D8A] tabular-nums">
                        {formatDistance(distanceKm)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#1F2937] truncate">{place.name}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{place.area}</span>
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="tabular-nums">
            <p className="text-base font-extrabold text-[#1F2937]">
              {formatRupiah(event.price, lang)}
            </p>
            <p className={`text-xs font-medium ${isFull ? 'text-red-600' : 'text-gray-500'}`}>
              {isFull ? t.full : t.spotsLeft(spotsLeft)}
            </p>
          </div>

          {isJoined ? (
            <button
              type="button"
              onClick={() => onToggleJoin(event)}
              className="flex-1 sm:flex-initial sm:min-w-[200px] min-h-[48px] px-5 rounded-2xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-[#1F2937] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#0F9D8A]" />
              <span>
                {t.joinedStatus} · {t.leaveEvent}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isFull}
              onClick={() => onToggleJoin(event)}
              className={`flex-1 sm:flex-initial sm:min-w-[200px] min-h-[48px] px-6 rounded-2xl text-sm font-bold inline-flex items-center justify-center transition-colors ${
                isFull
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : event.price > 0
                  ? 'bg-[#FF8A3D] hover:bg-[#e5772d] text-white shadow-sm cursor-pointer'
                  : 'bg-[#0F9D8A] hover:bg-[#0C8574] text-white shadow-sm cursor-pointer'
              }`}
            >
              {isFull ? t.full : event.price > 0 ? t.buyTicket : t.joinFree}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
