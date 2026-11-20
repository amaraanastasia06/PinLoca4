import { BadgeCheck, Star } from 'lucide-react';
import {
  CATEGORY_META,
  TRANSLATIONS,
  formatEventDate,
  formatRupiah,
  getCategoryLabel,
  getLevelLabel,
  getTodayDateString,
} from '../i18n';
import { ActivityEvent, Language } from '../types';

interface EventCardProps {
  event: ActivityEvent;
  lang: Language;
  isSelected?: boolean;
  onSelect: (event: ActivityEvent) => void;
  onOpenDetail: (event: ActivityEvent) => void;
}

export function EventCard({
  event,
  lang,
  isSelected,
  onSelect,
  onOpenDetail,
}: EventCardProps) {
  const t = TRANSLATIONS[lang];
  const meta = CATEGORY_META[event.category];
  const today = getTodayDateString();
  const isToday = event.date === today;
  const spotsLeft = Math.max(0, event.maxSpots - event.attendees.length);
  const isFull = spotsLeft === 0;

  const title = lang === 'en' && event.titleEn ? event.titleEn : event.title;

  return (
    <article
      onClick={() => {
        onSelect(event);
        onOpenDetail(event);
      }}
      className={`group rounded-2xl bg-white p-3.5 shadow-sm transition-all cursor-pointer border ${
        isSelected
          ? 'border-[#0F9D8A] ring-2 ring-[#0F9D8A]/15'
          : 'border-gray-200/80 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex gap-3.5">
        {/* Cover Thumbnail */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
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
              <span className="text-3xl select-none" aria-hidden="true">
                {meta.emoji}
              </span>
            </div>
          )}

          {isToday && (
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-[#FF8A3D] text-white text-[11px] font-bold shadow-xs">
              {t.todayBadge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Quiet unboxed metadata line */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 truncate">
              <span style={{ color: meta.color }} className="font-semibold">
                {getCategoryLabel(event.category, lang)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{event.area}</span>
              <span aria-hidden="true">·</span>
              <span>{getLevelLabel(event.level, lang)}</span>
            </div>

            <h3 className="mt-1 text-base font-bold text-[#1F2937] leading-snug line-clamp-2 group-hover:text-[#0F9D8A] transition-colors">
              {title}
            </h3>

            <p className="mt-1 text-xs text-gray-600 tabular-nums truncate">
              {formatEventDate(event.date, lang)} · {event.startTime}–{event.endTime} ·{' '}
              {event.locationName}
            </p>
          </div>

          {/* Footer row */}
          <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 min-w-0 text-xs text-gray-600">
              <span className="truncate font-medium">{event.hostName}</span>
              {event.hostVerified && (
                <BadgeCheck
                  className="w-3.5 h-3.5 text-[#0F9D8A] shrink-0"
                  aria-label={t.verified}
                />
              )}
              <span className="inline-flex items-center gap-0.5 text-gray-500 tabular-nums shrink-0">
                <Star className="w-3 h-3 fill-[#FF8A3D] text-[#FF8A3D]" />
                {event.hostRating.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 tabular-nums">
              <span
                className={`text-xs font-semibold ${
                  isFull ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {isFull ? t.full : t.spotsLeft(spotsLeft)}
              </span>
              <span className="text-sm font-bold text-[#0F9D8A]">
                {formatRupiah(event.price, lang)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
