import { ImagePlus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import {
  CATEGORY_META,
  TRANSLATIONS,
  getCategoryLabel,
  getLevelLabel,
  getTodayDateString,
} from '../i18n';
import {
  ActivityEvent,
  AreaName,
  EventCategory,
  EventLevel,
  Language,
  Place,
  User,
} from '../types';
import { AREA_CENTERS } from '../utils/geo';
import { MiniMap } from './MiniMap';

interface CreateEventModalProps {
  lang: Language;
  user: User;
  places: Place[];
  initialPlace?: Place | null;
  onClose: () => void;
  onCreate: (event: ActivityEvent) => void;
}

const CATEGORIES: EventCategory[] = ['Running', 'Yoga', 'Hiking', 'Workshop', 'Sports', 'Other'];
const LEVELS: EventLevel[] = ['Pemula', 'Menengah', 'Lanjutan'];

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CreateEventModal({
  lang,
  user,
  places,
  initialPlace,
  onClose,
  onCreate,
}: CreateEventModalProps) {
  const t = TRANSLATIONS[lang];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Running');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:30');
  const [locationMode, setLocationMode] = useState<'place' | 'pin'>(
    initialPlace ? 'place' : 'place'
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    initialPlace?.id || places[0]?.id || ''
  );
  const [area, setArea] = useState<AreaName>(initialPlace?.area || 'Canggu');
  const [customLocationName, setCustomLocationName] = useState('');
  const [pinnedLat, setPinnedLat] = useState<number>(
    initialPlace?.lat ?? AREA_CENTERS.Canggu.lat
  );
  const [pinnedLng, setPinnedLng] = useState<number>(
    initialPlace?.lng ?? AREA_CENTERS.Canggu.lng
  );
  const [priceStr, setPriceStr] = useState('0');
  const [maxSpotsStr, setMaxSpotsStr] = useState('12');
  const [level, setLevel] = useState<EventLevel>('Pemula');
  const [touristFriendly, setTouristFriendly] = useState(true);
  const [whatToBring, setWhatToBring] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      setCoverImage(dataUrl);
    } catch {
      // ignore invalid file
    }
  };

  const handleAreaChange = (nextArea: AreaName) => {
    setArea(nextArea);
    setPinnedLat(AREA_CENTERS[nextArea].lat);
    setPinnedLng(AREA_CENTERS[nextArea].lng);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenPlace =
      locationMode === 'place' ? places.find((p) => p.id === selectedPlaceId) : undefined;

    const finalArea: AreaName = chosenPlace ? chosenPlace.area : area;
    const finalLocationName = chosenPlace
      ? chosenPlace.name
      : customLocationName.trim() || `${finalArea} Meetup Point`;
    const finalLat = chosenPlace?.lat ?? pinnedLat;
    const finalLng = chosenPlace?.lng ?? pinnedLng;

    const initials = user.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newEvent: ActivityEvent = {
      id: `evt-user-${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() ||
        (lang === 'id'
          ? 'Kegiatan komunitas terbuka untuk semua yang ingin bergerak bersama.'
          : 'Open community session for anyone looking to move and connect.'),
      category,
      date,
      startTime,
      endTime,
      area: finalArea,
      locationName: finalLocationName,
      address: chosenPlace?.address,
      lat: finalLat,
      lng: finalLng,
      placeId: chosenPlace?.id,
      price: Math.max(0, parseInt(priceStr || '0', 10) || 0),
      maxSpots: Math.max(2, parseInt(maxSpotsStr || '12', 10) || 12),
      attendees: [
        {
          id: user.id,
          name: user.name,
          initials: initials || 'PL',
          color: '#0F9D8A',
        },
      ],
      level,
      touristFriendly,
      whatToBring:
        whatToBring.trim() ||
        (lang === 'id' ? 'Air minum dan pakaian olahraga nyaman.' : 'Water and comfortable activewear.'),
      hostId: user.id,
      hostName: user.name,
      hostRating: 5.0,
      hostVerified: false,
      coverImage,
      coverGradient: CATEGORY_META[category].gradient,
    };

    onCreate(newEvent);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end lg:items-center justify-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.createEventTitle}
      onClick={onClose}
    >
      <div
        className="w-full lg:max-w-xl max-h-[92vh] bg-[#FAFAF7] rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-5 py-4 border-b border-gray-200/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-[#1F2937]">{t.createEventTitle}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t.createEventSubtitle}</p>
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

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto pinloca-scroll p-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.eventTitleLabel} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.eventTitlePlaceholder}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F9D8A]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.category}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-[#0F9D8A] text-white border-[#0F9D8A]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {CATEGORY_META[cat].emoji} {getCategoryLabel(cat, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.coverImageLabel}
            </label>
            {coverImage ? (
              <div className="relative h-36 rounded-2xl overflow-hidden border border-gray-200">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage(undefined)}
                  className="absolute top-2 right-2 px-3 py-1.5 rounded-xl bg-white/95 text-red-600 text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.removeImageBtn}</span>
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-white hover:border-[#0F9D8A] text-xs font-semibold text-gray-600 cursor-pointer transition-colors">
                <ImagePlus className="w-4 h-4 text-[#0F9D8A]" />
                <span>{t.uploadImageBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.eventDescLabel}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.eventDescPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F9D8A]"
            />
          </div>

          {/* Date & 24h Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.date}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.startTimeLabel}
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.endTimeLabel}
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
          </div>

          {/* Location Selector: Pick Place OR Pin on Map */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-200/90 space-y-3">
            <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLocationMode('place')}
                className={`min-h-[38px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  locationMode === 'place'
                    ? 'bg-white text-[#1F2937] shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                {t.locationModePlace}
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('pin')}
                className={`min-h-[38px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  locationMode === 'pin'
                    ? 'bg-white text-[#1F2937] shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                {t.locationModePin}
              </button>
            </div>

            {locationMode === 'place' ? (
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t.selectPlaceLabel}
                </label>
                <select
                  value={selectedPlaceId}
                  onChange={(e) => setSelectedPlaceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm text-[#1F2937]"
                >
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.area})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {(['Canggu', 'Ubud'] as AreaName[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => handleAreaChange(a)}
                      className={`min-h-[38px] rounded-xl text-xs font-bold border cursor-pointer ${
                        area === a
                          ? 'bg-[#FF8A3D] text-white border-[#FF8A3D]'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required={locationMode === 'pin'}
                  value={customLocationName}
                  onChange={(e) => setCustomLocationName(e.target.value)}
                  placeholder={t.customLocationPlaceholder}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm"
                />

                <p className="text-xs text-gray-500">{t.pinOnMapHint}</p>
                <MiniMap
                  lat={pinnedLat}
                  lng={pinnedLng}
                  color={CATEGORY_META[category].color}
                  interactivePick
                  onPickLocation={(lat, lng) => {
                    setPinnedLat(lat);
                    setPinnedLng(lng);
                  }}
                  heightClass="h-44"
                />
              </div>
            )}
          </div>

          {/* Price & Max Spots */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.priceLabel}
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.maxSpotsLabel}
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={maxSpotsStr}
                onChange={(e) => setMaxSpotsStr(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm tabular-nums"
              />
            </div>
          </div>

          {/* Level & Tourist Friendly */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                {t.level}
              </label>
              <div className="flex gap-1.5">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`flex-1 min-h-[40px] rounded-xl text-xs font-bold border cursor-pointer ${
                      level === lvl
                        ? 'bg-[#1F2937] text-white border-[#1F2937]'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {getLevelLabel(lvl, lang)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white px-3.5 py-2 min-h-[44px] rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-[#1F2937]">{t.touristFriendly}</span>
              <button
                type="button"
                role="switch"
                aria-checked={touristFriendly}
                onClick={() => setTouristFriendly((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  touristFriendly ? 'bg-[#0F9D8A]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    touristFriendly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* What to bring */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              {t.whatToBringLabel}
            </label>
            <input
              type="text"
              value={whatToBring}
              onChange={(e) => setWhatToBring(e.target.value)}
              placeholder={t.whatToBringPlaceholder}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#0F9D8A] hover:bg-[#0C8574] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              {t.publishEventBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
