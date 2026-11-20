import { MapPin, Plus, User as UserIcon } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';
import { Language, User } from '../types';

interface HeaderProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  activeTab: 'explore' | 'places';
  onChangeTab: (tab: 'explore' | 'places') => void;
  onOpenCreate: () => void;
  user: User | null;
  onOpenAuthOrProfile: () => void;
}

export function Header({
  lang,
  onToggleLang,
  activeTab,
  onChangeTab,
  onOpenCreate,
  user,
  onOpenAuthOrProfile,
}: HeaderProps) {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-30 h-14 lg:h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 lg:px-6 flex items-center justify-between gap-4 lg:gap-8">
      {/* Brand Zone */}
      <button
        type="button"
        onClick={() => onChangeTab('explore')}
        className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9D8A] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
      >
        <span className="w-8 h-8 rounded-xl bg-[#0F9D8A] text-white flex items-center justify-center shadow-sm">
          <MapPin className="w-4 h-4 stroke-[2.5]" />
        </span>
        <span className="text-lg font-extrabold tracking-tight text-[#1F2937]">Pinloca</span>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        <button
          type="button"
          onClick={() => onChangeTab('explore')}
          className={`text-sm font-semibold py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'explore'
              ? 'border-[#0F9D8A] text-[#0F9D8A]'
              : 'border-transparent text-gray-600 hover:text-[#1F2937]'
          }`}
        >
          {t.navExplore}
        </button>
        <button
          type="button"
          onClick={() => onChangeTab('places')}
          className={`text-sm font-semibold py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'places'
              ? 'border-[#0F9D8A] text-[#0F9D8A]'
              : 'border-transparent text-gray-600 hover:text-[#1F2937]'
          }`}
        >
          {t.navPlaces}
        </button>
      </nav>

      {/* Action Zone */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Toggle ID / EN */}
        <div
          className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200/70"
          role="group"
          aria-label="Language toggle"
        >
          <button
            type="button"
            onClick={() => onToggleLang('id')}
            className={`px-2.5 py-1.5 min-h-[34px] text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              lang === 'id'
                ? 'bg-white text-[#1F2937] shadow-xs'
                : 'text-gray-500 hover:text-[#1F2937]'
            }`}
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => onToggleLang('en')}
            className={`px-2.5 py-1.5 min-h-[34px] text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              lang === 'en'
                ? 'bg-white text-[#1F2937] shadow-xs'
                : 'text-gray-500 hover:text-[#1F2937]'
            }`}
          >
            EN
          </button>
        </div>

        {/* Desktop Create Event Button */}
        <button
          type="button"
          onClick={onOpenCreate}
          className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#0F9D8A] hover:bg-[#0C8574] text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.navCreate}</span>
        </button>

        {/* User Profile / Sign-in Button */}
        <button
          type="button"
          onClick={onOpenAuthOrProfile}
          className="inline-flex items-center gap-2 px-3 py-1.5 min-h-[40px] rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-[#1F2937] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-[#0F9D8A]/10 text-[#0F9D8A] flex items-center justify-center shrink-0">
            <UserIcon className="w-3.5 h-3.5" />
          </span>
          <span className="max-w-[100px] sm:max-w-[140px] truncate">
            {user ? user.name : t.signIn}
          </span>
        </button>
      </div>
    </header>
  );
}
