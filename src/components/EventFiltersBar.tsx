import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import {
  TRANSLATIONS,
  getCategoryLabel,
  getLevelLabel,
  getTimeOfDayLabel,
} from '../i18n';
import {
  DateFilterOption,
  EventCategory,
  EventFilters,
  EventLevel,
  Language,
  PriceFilterOption,
  TimeOfDay,
} from '../types';

interface EventFiltersBarProps {
  lang: Language;
  filters: EventFilters;
  onChange: (next: EventFilters) => void;
  onReset: () => void;
  resultCount: number;
}

const CATEGORIES: EventCategory[] = ['Running', 'Yoga', 'Hiking', 'Workshop', 'Sports', 'Other'];
const LEVELS: EventLevel[] = ['Pemula', 'Menengah', 'Lanjutan'];
const TIMES: TimeOfDay[] = ['Pagi', 'Siang', 'Sore/Malam'];

export function EventFiltersBar({
  lang,
  filters,
  onChange,
  onReset,
  resultCount,
}: EventFiltersBarProps) {
  const t = TRANSLATIONS[lang];
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilter =
    filters.category !== 'all' ||
    filters.dateOption !== 'all' ||
    filters.timeOfDay !== 'all' ||
    filters.price !== 'all' ||
    filters.level !== 'all' ||
    filters.touristFriendlyOnly ||
    filters.area !== 'all';

  return (
    <div className="space-y-3">
      {/* Category horizontal chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          type="button"
          onClick={() => onChange({ ...filters, category: 'all' })}
          className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            filters.category === 'all'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {t.all}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() =>
              onChange({ ...filters, category: filters.category === cat ? 'all' : cat })
            }
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filters.category === cat
                ? 'bg-[#0F9D8A] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {getCategoryLabel(cat, lang)}
          </button>
        ))}
      </div>

      {/* Date quick chips + Filter drawer toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: t.all },
              { id: 'today', label: t.todayBadge },
              { id: 'tomorrow', label: t.tomorrow },
              { id: 'week', label: t.thisWeek },
              { id: 'custom', label: t.customDate },
            ] as Array<{ id: DateFilterOption; label: string }>
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...filters, dateOption: item.id })}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.dateOption === item.id
                  ? 'bg-[#1F2937] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            expanded
              ? 'bg-[#0F9D8A]/10 border-[#0F9D8A] text-[#0F9D8A]'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {expanded ? <X className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
          <span>{t.filters}</span>
        </button>
      </div>

      {/* Custom Date Input */}
      {filters.dateOption === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.customDate}
            onChange={(e) => onChange({ ...filters, customDate: e.target.value })}
            className="w-full px-3 py-2 min-h-[40px] rounded-xl border border-gray-200 bg-white text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F9D8A]"
          />
        </div>
      )}

      {/* Expanded Filters (Time of day, Price, Level, Tourist-friendly) */}
      {expanded && (
        <div className="rounded-2xl bg-white border border-gray-200/90 p-3.5 space-y-3 shadow-xs">
          {/* Time of day */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">{t.timeOfDay}</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onChange({ ...filters, timeOfDay: 'all' })}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.timeOfDay === 'all'
                    ? 'bg-[#0F9D8A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                }`}
              >
                {t.all}
              </button>
              {TIMES.map((tod) => (
                <button
                  key={tod}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, timeOfDay: filters.timeOfDay === tod ? 'all' : tod })
                  }
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer ${
                    filters.timeOfDay === tod
                      ? 'bg-[#0F9D8A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  {getTimeOfDayLabel(tod, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">{t.price}</p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'all', label: t.all },
                    { id: 'free', label: t.free },
                    { id: 'paid', label: t.paid },
                  ] as Array<{ id: PriceFilterOption; label: string }>
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ...filters, price: opt.id })}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer ${
                      filters.price === opt.id
                        ? 'bg-[#0F9D8A] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">{t.level}</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, level: 'all' })}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer ${
                    filters.level === 'all'
                      ? 'bg-[#0F9D8A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  {t.all}
                </button>
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      onChange({ ...filters, level: filters.level === lvl ? 'all' : lvl })
                    }
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer ${
                      filters.level === lvl
                        ? 'bg-[#0F9D8A] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200/70'
                    }`}
                  >
                    {getLevelLabel(lvl, lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tourist-friendly toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-[#1F2937]">{t.touristFriendly}</span>
            <button
              type="button"
              role="switch"
              aria-checked={filters.touristFriendlyOnly}
              onClick={() =>
                onChange({ ...filters, touristFriendlyOnly: !filters.touristFriendlyOnly })
              }
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
                filters.touristFriendlyOnly ? 'bg-[#0F9D8A]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  filters.touristFriendlyOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Result Count + Reset */}
      <div className="flex items-center justify-between text-xs text-gray-600 px-0.5">
        <span className="font-medium tabular-nums">{t.resultsEvents(resultCount)}</span>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 font-semibold text-[#0F9D8A] hover:underline py-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFilter}</span>
          </button>
        )}
      </div>
    </div>
  );
}
