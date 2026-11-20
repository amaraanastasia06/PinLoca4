import { Compass, MapPin, PlusCircle, User as UserIcon } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';
import { Language, User } from '../types';

interface MobileNavProps {
  lang: Language;
  activeTab: 'explore' | 'places';
  onChangeTab: (tab: 'explore' | 'places') => void;
  onOpenCreate: () => void;
  onOpenAuthOrProfile: () => void;
  user: User | null;
}

export function MobileNav({
  lang,
  activeTab,
  onChangeTab,
  onOpenCreate,
  onOpenAuthOrProfile,
  user,
}: MobileNavProps) {
  const t = TRANSLATIONS[lang];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-gray-200 grid grid-cols-4 items-center px-2"
      aria-label="Mobile navigation"
    >
      <button
        type="button"
        onClick={() => onChangeTab('explore')}
        className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
          activeTab === 'explore' ? 'text-[#0F9D8A]' : 'text-gray-500 hover:text-[#1F2937]'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5 leading-none">{t.navExploreShort}</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeTab('places')}
        className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
          activeTab === 'places' ? 'text-[#0F9D8A]' : 'text-gray-500 hover:text-[#1F2937]'
        }`}
      >
        <MapPin className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5 leading-none">{t.navPlaces}</span>
      </button>

      <button
        type="button"
        onClick={onOpenCreate}
        className="flex flex-col items-center justify-center min-h-[44px] text-[#FF8A3D] hover:text-[#e67329] transition-colors cursor-pointer"
      >
        <PlusCircle className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5 leading-none">{t.navCreateShort}</span>
      </button>

      <button
        type="button"
        onClick={onOpenAuthOrProfile}
        className="flex flex-col items-center justify-center min-h-[44px] text-gray-500 hover:text-[#1F2937] transition-colors cursor-pointer"
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5 leading-none max-w-[68px] truncate">
          {user ? user.name.split(' ')[0] : t.navProfile}
        </span>
      </button>
    </nav>
  );
}
