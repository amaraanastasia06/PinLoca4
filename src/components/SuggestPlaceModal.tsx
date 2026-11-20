import { X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { TRANSLATIONS, getPlaceCategoryLabel } from '../i18n';
import { AreaName, Language, Place, PlaceCategory } from '../types';

interface SuggestPlaceModalProps {
  lang: Language;
  onClose: () => void;
  onSubmit: (place: Place) => void;
}

const PLACE_CATS: PlaceCategory[] = ['Gym', 'Yoga & Pilates', 'Kafe', 'Outdoor'];

export function SuggestPlaceModal({ lang, onClose, onSubmit }: SuggestPlaceModalProps) {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('Kafe');
  const [area, setArea] = useState<AreaName>('Canggu');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlace: Place = {
      id: `place-user-${Date.now()}`,
      name: name.trim(),
      category,
      area,
      address: address.trim() || undefined,
      tags: [getPlaceCategoryLabel(category, 'id'), area],
      tagsEn: [getPlaceCategoryLabel(category, 'en'), area],
      description:
        description.trim() ||
        `${getPlaceCategoryLabel(category, 'id')} di kawasan ${area} dari saran komunitas.`,
      descriptionEn:
        description.trim() ||
        `${getPlaceCategoryLabel(category, 'en')} in ${area} suggested by the community.`,
      isUserSuggested: true,
    };

    onSubmit(newPlace);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end lg:items-center justify-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.suggestPlaceTitle}
      onClick={onClose}
    >
      <div
        className="w-full lg:max-w-md max-h-[90vh] bg-[#FAFAF7] rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-5 py-4 border-b border-gray-200/80 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#1F2937]">{t.suggestPlaceTitle}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t.suggestPlaceSubtitle}</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto pinloca-scroll">
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.placeNameLabel} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.placeNamePlaceholder}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F9D8A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.category}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLACE_CATS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-[#1F2937] text-white border-[#1F2937]'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {getPlaceCategoryLabel(cat, lang)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.areaLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Canggu', 'Ubud'] as AreaName[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`min-h-[42px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    area === a
                      ? 'bg-[#0F9D8A] text-white border-[#0F9D8A]'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.addressOptional}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.addressPlaceholder}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.shortDescOptional}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.shortDescPlaceholder}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm"
            />
          </div>

          <p className="text-[11px] text-gray-500 text-center">{t.placeFooterNote}</p>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-2xl bg-[#FF8A3D] hover:bg-[#e5772d] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            {t.submitSuggestion}
          </button>
        </form>
      </div>
    </div>
  );
}
