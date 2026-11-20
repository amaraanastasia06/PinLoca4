import { Bookmark, CalendarCheck, LogOut, MapPin, Phone, User as UserIcon, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { TRANSLATIONS, formatEventDate, getPlaceCategoryLabel } from '../i18n';
import { ActivityEvent, Language, Place, User } from '../types';

interface AuthModalProps {
  lang: Language;
  user: User | null;
  events: ActivityEvent[];
  places: Place[];
  favoritePlaceIds: string[];
  onClose: () => void;
  onSignIn: (name: string, phone: string) => void;
  onSignOut: () => void;
  onOpenEvent: (event: ActivityEvent) => void;
  onOpenPlace: (place: Place) => void;
}

export function AuthModal({
  lang,
  user,
  events,
  places,
  favoritePlaceIds,
  onClose,
  onSignIn,
  onSignOut,
  onOpenEvent,
  onOpenPlace,
}: AuthModalProps) {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSignIn(name.trim(), phone.trim());
  };

  if (!user) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={t.signInTitle}
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#0F9D8A] text-white flex items-center justify-center">
                <MapPin className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span className="font-extrabold text-[#1F2937]">Pinloca</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#1F2937]">{t.signInTitle}</h2>
              <p className="text-xs text-gray-500 mt-1">{t.signInSubtitle}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.nameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-[#FAFAF7] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F9D8A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-[#FAFAF7] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F9D8A] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#0F9D8A] hover:bg-[#0C8574] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              {t.continueBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const joinedEvents = events.filter((e) => e.attendees.some((a) => a.id === user.id));
  const hostedEvents = events.filter((e) => e.hostId === user.id);
  const savedPlaces = places.filter((p) => favoritePlaceIds.includes(p.id));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.profileTitle}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[88vh] bg-[#FAFAF7] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-5 py-4 border-b border-gray-200/80 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-extrabold text-[#1F2937]">{t.profileTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pinloca-scroll p-5 space-y-5">
          {/* User Card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#0F9D8A]/12 text-[#0F9D8A] flex items-center justify-center shrink-0">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[#1F2937] truncate">{user.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 tabular-nums">
                  <Phone className="w-3 h-3" />
                  <span>{user.phone}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.signOut}</span>
            </button>
          </div>

          {/* Joined Events */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-[#0F9D8A]" />
              <span>
                {t.myJoinedEvents} ({joinedEvents.length})
              </span>
            </h3>
            {joinedEvents.length === 0 ? (
              <p className="text-xs text-gray-500 bg-white rounded-2xl p-3.5 border border-gray-200/80">
                {t.noJoinedYet}
              </p>
            ) : (
              <div className="space-y-2">
                {joinedEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => onOpenEvent(evt)}
                    className="w-full text-left bg-white hover:border-[#0F9D8A] rounded-2xl p-3 border border-gray-200/80 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-bold text-[#1F2937] truncate">
                      {lang === 'en' && evt.titleEn ? evt.titleEn : evt.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                      {formatEventDate(evt.date, lang)} · {evt.startTime} · {evt.locationName}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hosted Events */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500">
              {t.myHostedEvents} ({hostedEvents.length})
            </h3>
            {hostedEvents.length === 0 ? (
              <p className="text-xs text-gray-500 bg-white rounded-2xl p-3.5 border border-gray-200/80">
                {t.noHostedYet}
              </p>
            ) : (
              <div className="space-y-2">
                {hostedEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => onOpenEvent(evt)}
                    className="w-full text-left bg-white hover:border-[#0F9D8A] rounded-2xl p-3 border border-gray-200/80 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-bold text-[#1F2937] truncate">{evt.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                      {formatEventDate(evt.date, lang)} · {evt.startTime} ·{' '}
                      {t.attendeesCount(evt.attendees.length, evt.maxSpots)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Places */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>
                {t.mySavedPlaces} ({savedPlaces.length})
              </span>
            </h3>
            {savedPlaces.length === 0 ? (
              <p className="text-xs text-gray-500 bg-white rounded-2xl p-3.5 border border-gray-200/80">
                {t.noSavedYet}
              </p>
            ) : (
              <div className="space-y-2">
                {savedPlaces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onOpenPlace(p)}
                    className="w-full text-left bg-white hover:border-[#0F9D8A] rounded-2xl p-3 border border-gray-200/80 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-bold text-[#1F2937] truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getPlaceCategoryLabel(p.category, lang)} · {p.area}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
