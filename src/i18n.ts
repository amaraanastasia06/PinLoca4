import { EventCategory, EventLevel, Language, PlaceCategory, TimeOfDay } from './types';

export const CATEGORY_META: Record<
  EventCategory,
  {
    color: string;
    emoji: string;
    gradient: string;
    labelId: string;
    labelEn: string;
  }
> = {
  Running: {
    color: '#FF8A3D',
    emoji: '🏃',
    gradient: 'from-[#FF8A3D] via-[#F97316] to-[#FB923C]',
    labelId: 'Lari',
    labelEn: 'Running',
  },
  Yoga: {
    color: '#0F9D8A',
    emoji: '🧘',
    gradient: 'from-[#0F9D8A] via-[#14B8A6] to-[#2DD4BF]',
    labelId: 'Yoga',
    labelEn: 'Yoga',
  },
  Hiking: {
    color: '#2E7D32',
    emoji: '🥾',
    gradient: 'from-[#2E7D32] via-[#15803D] to-[#22C55E]',
    labelId: 'Hiking',
    labelEn: 'Hiking',
  },
  Workshop: {
    color: '#8B5CF6',
    emoji: '🌿',
    gradient: 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
    labelId: 'Workshop',
    labelEn: 'Workshop',
  },
  Sports: {
    color: '#2563EB',
    emoji: '🏐',
    gradient: 'from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]',
    labelId: 'Olahraga',
    labelEn: 'Sports',
  },
  Other: {
    color: '#D97706',
    emoji: '✨',
    gradient: 'from-[#B45309] via-[#D97706] to-[#FBBF24]',
    labelId: 'Lainnya',
    labelEn: 'Other',
  },
};

export const PLACE_CATEGORY_META: Record<
  PlaceCategory,
  {
    color: string;
    labelId: string;
    labelEn: string;
  }
> = {
  Gym: {
    color: '#1F2937',
    labelId: 'Gym',
    labelEn: 'Gym',
  },
  'Yoga & Pilates': {
    color: '#0F9D8A',
    labelId: 'Yoga & Pilates',
    labelEn: 'Yoga & Pilates',
  },
  Kafe: {
    color: '#B45309',
    labelId: 'Kafe',
    labelEn: 'Cafe',
  },
  Outdoor: {
    color: '#2E7D32',
    labelId: 'Outdoor',
    labelEn: 'Outdoor',
  },
};

export function getCategoryLabel(cat: EventCategory, lang: Language): string {
  return lang === 'id' ? CATEGORY_META[cat].labelId : CATEGORY_META[cat].labelEn;
}

export function getPlaceCategoryLabel(cat: PlaceCategory, lang: Language): string {
  return lang === 'id' ? PLACE_CATEGORY_META[cat].labelId : PLACE_CATEGORY_META[cat].labelEn;
}

export function getLevelLabel(level: EventLevel, lang: Language): string {
  if (lang === 'id') return level;
  if (level === 'Pemula') return 'Beginner';
  if (level === 'Menengah') return 'Intermediate';
  return 'Advanced';
}

export function getTimeOfDayLabel(tod: TimeOfDay, lang: Language): string {
  if (lang === 'id') return tod;
  if (tod === 'Pagi') return 'Morning';
  if (tod === 'Siang') return 'Afternoon';
  return 'Evening';
}

export function formatRupiah(amount: number, lang: Language): string {
  if (amount <= 0) {
    return lang === 'id' ? 'Gratis' : 'Free';
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp${formatted}`;
}

const ID_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatEventDate(dateStr: string, lang: Language): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  if (Number.isNaN(dt.getTime())) return dateStr;
  const dayName = lang === 'id' ? ID_DAYS[dt.getDay()] : EN_DAYS[dt.getDay()];
  const monthName = lang === 'id' ? ID_MONTHS[dt.getMonth()] : EN_MONTHS[dt.getMonth()];
  return `${dayName}, ${dt.getDate()} ${monthName}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateString(baseStr: string, days: number): string {
  const [y, m, d] = baseStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, '0');
  const nd = String(dt.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export function getTimeOfDayFromTime(timeStr: string): TimeOfDay {
  const hour = parseInt(timeStr.split(':')[0] || '0', 10);
  if (hour < 12) return 'Pagi';
  if (hour < 17) return 'Siang';
  return 'Sore/Malam';
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.max(50, Math.round(km * 1000))} m`;
  }
  return `${km.toFixed(1)} km`;
}

export const TRANSLATIONS = {
  id: {
    tagline: 'Cari kegiatan, temukan teman.',
    navExplore: 'Peta & Kegiatan',
    navExploreShort: 'Jelajah',
    navPlaces: 'Tempat',
    navCreate: 'Buat Kegiatan',
    navCreateShort: 'Buat',
    navProfile: 'Profil',
    signIn: 'Masuk',
    signOut: 'Keluar',
    signInTitle: 'Masuk ke Pinloca',
    signInSubtitle: 'Masukkan nama dan nomor HP untuk ikut kegiatan atau menjadi host.',
    nameLabel: 'Nama lengkap',
    namePlaceholder: 'Contoh: Nadia Kusuma',
    phoneLabel: 'Nomor HP / WhatsApp',
    phonePlaceholder: 'Contoh: 081234567890',
    continueBtn: 'Lanjutkan',
    cancel: 'Batal',
    layerEvents: 'Kegiatan',
    layerPlaces: 'Tempat',
    allAreas: 'Semua Bali',
    all: 'Semua',
    todayBadge: 'Hari ini',
    tomorrow: 'Besok',
    thisWeek: 'Minggu ini',
    customDate: 'Pilih tanggal',
    filters: 'Filter',
    resetFilter: 'Reset filter',
    resultsEvents: (n: number) => `${n} kegiatan ditemukan`,
    resultsPlaces: (n: number) => `${n} tempat ditemukan`,
    category: 'Kategori',
    date: 'Tanggal',
    timeOfDay: 'Waktu',
    price: 'Harga',
    free: 'Gratis',
    paid: 'Berbayar',
    level: 'Tingkat',
    touristFriendly: 'Ramah turis',
    viewDetail: 'Lihat detail',
    spotsLeft: (n: number) => `${n} tempat tersisa`,
    full: 'Penuh',
    verified: 'Terverifikasi',
    attendeesCount: (joined: number, max: number) => `${joined}/${max} peserta`,
    whatToBring: 'Yang perlu dibawa',
    location: 'Lokasi',
    directions: 'Petunjuk arah',
    openInGoogleMaps: 'Buka di Google Maps',
    travelMode: 'Moda perjalanan',
    modeDriving: 'Motor/Mobil',
    modeWalking: 'Jalan',
    nearbyPlaces: 'Tempat di sekitar',
    nearbyPlacesEmpty: 'Belum ada tempat tercatat dalam radius 3 km.',
    nearbyEvents: 'Kegiatan di sekitar sini',
    nearbyEventsEmpty: 'Belum ada kegiatan dalam radius 2 km.',
    cancellationPaid: 'Pembatalan gratis hingga 24 jam sebelum acara.',
    joinFree: 'Gabung',
    buyTicket: 'Beli tiket',
    joinedStatus: 'Kamu terdaftar',
    leaveEvent: 'Batalkan keikutsertaan',
    share: 'Bagikan',
    linkCopied: 'Tautan kegiatan disalin!',
    joinedToast: 'Berhasil mendaftar ke kegiatan!',
    leftToast: 'Pendaftaran dibatalkan.',
    savePlace: 'Simpan',
    savedPlace: 'Tersimpan',
    createEventHere: 'Buat kegiatan di sini',
    placeHoursNote: 'Jam buka dan info terbaru: cek di Google Maps.',
    placeFooterNote: 'Daftar tempat dikurasi sebagai referensi, bukan iklan atau kerja sama resmi.',
    approximateLocation: 'Perkiraan lokasi',
    userSuggested: 'Saran pengguna',
    searchPlacesPlaceholder: 'Cari gym, studio yoga, kafe, outdoor...',
    sortNearest: 'Terdekat',
    sortAlpha: 'A–Z',
    favoritesOnly: 'Tersimpan',
    locationDeniedNote: 'Izin lokasi tidak aktif — diurutkan secara alfabetis.',
    suggestPlace: 'Sarankan tempat',
    suggestPlaceTitle: 'Sarankan Tempat Baru',
    suggestPlaceSubtitle: 'Tambahkan spot olahraga, studio, kafe sehat, atau jalur outdoor di Bali.',
    placeNameLabel: 'Nama tempat',
    placeNamePlaceholder: 'Contoh: Kopi Sehat Canggu',
    areaLabel: 'Area',
    addressOptional: 'Alamat (opsional)',
    addressPlaceholder: 'Contoh: Jl. Pantai Berawa No. 12',
    shortDescOptional: 'Catatan singkat netral (opsional)',
    shortDescPlaceholder: 'Contoh: Kafe dengan ruang terbuka dan menu smoothie bowl.',
    submitSuggestion: 'Kirim Saran Tempat',
    placeSuggestedToast: 'Tempat berhasil ditambahkan!',
    createEventTitle: 'Buat Kegiatan Baru',
    createEventSubtitle: 'Ajak komunitas bergerak dan bertemu teman baru di Bali.',
    eventTitleLabel: 'Judul kegiatan',
    eventTitlePlaceholder: 'Contoh: Lari Santai Pagi di Berawa',
    eventDescLabel: 'Deskripsi',
    eventDescPlaceholder: 'Ceritakan suasana kegiatan, rute, atau hal seru yang akan dilakukan.',
    startTimeLabel: 'Jam mulai',
    endTimeLabel: 'Jam selesai',
    locationModePlace: 'Pilih dari daftar Tempat',
    locationModePin: 'Tentukan titik di peta',
    selectPlaceLabel: 'Pilih tempat',
    customLocationName: 'Nama lokasi / titik kumpul',
    customLocationPlaceholder: 'Contoh: Parkiran Pantai Batu Bolong',
    pinOnMapHint: 'Ketuk peta di bawah untuk menaruh pin lokasi.',
    priceLabel: 'Harga tiket (Rp, isi 0 jika gratis)',
    maxSpotsLabel: 'Kapasitas maksimal peserta',
    whatToBringLabel: 'Yang perlu dibawa',
    whatToBringPlaceholder: 'Contoh: Air minum, handuk kecil, matras pribadi',
    coverImageLabel: 'Foto sampul (opsional)',
    uploadImageBtn: 'Unggah foto',
    removeImageBtn: 'Hapus foto',
    publishEventBtn: 'Terbitkan Kegiatan',
    eventCreatedToast: 'Kegiatan berhasil diterbitkan!',
    emptyEventsTitle: 'Tidak ada kegiatan yang cocok',
    emptyEventsDesc: 'Coba ubah filter atau pilih area lain di Canggu dan Ubud.',
    emptyPlacesTitle: 'Tempat tidak ditemukan',
    emptyPlacesDesc: 'Coba kata kunci lain atau sarankan tempat baru.',
    geocodingPins: (remaining: number) => `Menyelaraskan lokasi tempat (${remaining})...`,
    profileTitle: 'Profil Saya',
    myJoinedEvents: 'Kegiatan Diikuti',
    myHostedEvents: 'Kegiatan Dibuat',
    mySavedPlaces: 'Tempat Tersimpan',
    noJoinedYet: 'Belum ada kegiatan yang kamu ikuti.',
    noHostedYet: 'Kamu belum membuat kegiatan.',
    noSavedYet: 'Belum ada tempat yang kamu simpan.',
    close: 'Tutup',
    back: 'Kembali',
    tapToExpand: 'Ketuk atau geser ke atas untuk daftar lengkap',
  },
  en: {
    tagline: 'Find activities, find your people.',
    navExplore: 'Map & Activities',
    navExploreShort: 'Explore',
    navPlaces: 'Places',
    navCreate: 'Host Activity',
    navCreateShort: 'Host',
    navProfile: 'Profile',
    signIn: 'Sign in',
    signOut: 'Sign out',
    signInTitle: 'Sign in to Pinloca',
    signInSubtitle: 'Enter your name and phone number to join or host community activities.',
    nameLabel: 'Full name',
    namePlaceholder: 'e.g. Nadia Kusuma',
    phoneLabel: 'Phone / WhatsApp number',
    phonePlaceholder: 'e.g. +62 812 3456 7890',
    continueBtn: 'Continue',
    cancel: 'Cancel',
    layerEvents: 'Activities',
    layerPlaces: 'Places',
    allAreas: 'All Bali',
    all: 'All',
    todayBadge: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    customDate: 'Pick date',
    filters: 'Filters',
    resetFilter: 'Reset filters',
    resultsEvents: (n: number) => `${n} ${n === 1 ? 'activity' : 'activities'} found`,
    resultsPlaces: (n: number) => `${n} ${n === 1 ? 'place' : 'places'} found`,
    category: 'Category',
    date: 'Date',
    timeOfDay: 'Time of day',
    price: 'Price',
    free: 'Free',
    paid: 'Paid',
    level: 'Level',
    touristFriendly: 'Tourist-friendly',
    viewDetail: 'View details',
    spotsLeft: (n: number) => `${n} ${n === 1 ? 'spot' : 'spots'} left`,
    full: 'Full',
    verified: 'Verified',
    attendeesCount: (joined: number, max: number) => `${joined}/${max} going`,
    whatToBring: 'What to bring',
    location: 'Location',
    directions: 'Directions',
    openInGoogleMaps: 'Open in Google Maps',
    travelMode: 'Travel mode',
    modeDriving: 'Scooter/Car',
    modeWalking: 'Walking',
    nearbyPlaces: 'Places nearby',
    nearbyPlacesEmpty: 'No curated places found within 3 km.',
    nearbyEvents: 'Activities nearby',
    nearbyEventsEmpty: 'No activities within 2 km.',
    cancellationPaid: 'Free cancellation up to 24 hours before the event.',
    joinFree: 'Join',
    buyTicket: 'Buy ticket',
    joinedStatus: "You're going",
    leaveEvent: 'Cancel spot',
    share: 'Share',
    linkCopied: 'Activity link copied!',
    joinedToast: 'Successfully joined the activity!',
    leftToast: 'Registration cancelled.',
    savePlace: 'Save',
    savedPlace: 'Saved',
    createEventHere: 'Host activity here',
    placeHoursNote: 'Opening hours & latest info: check on Google Maps.',
    placeFooterNote: 'Places are curated for reference only, not ads or official partnerships.',
    approximateLocation: 'Approximate location',
    userSuggested: 'User suggested',
    searchPlacesPlaceholder: 'Search gyms, yoga studios, cafes, outdoor...',
    sortNearest: 'Nearest',
    sortAlpha: 'A–Z',
    favoritesOnly: 'Saved',
    locationDeniedNote: 'Location access unavailable — sorted alphabetically.',
    suggestPlace: 'Suggest a place',
    suggestPlaceTitle: 'Suggest a New Place',
    suggestPlaceSubtitle: 'Add a fitness spot, studio, healthy cafe, or outdoor trail in Bali.',
    placeNameLabel: 'Place name',
    placeNamePlaceholder: 'e.g. Kopi Sehat Canggu',
    areaLabel: 'Area',
    addressOptional: 'Address (optional)',
    addressPlaceholder: 'e.g. Jl. Pantai Berawa No. 12',
    shortDescOptional: 'Short neutral note (optional)',
    shortDescPlaceholder: 'e.g. Open-air cafe with smoothie bowls and post-workout drinks.',
    submitSuggestion: 'Submit Place',
    placeSuggestedToast: 'Place added to the map!',
    createEventTitle: 'Create New Activity',
    createEventSubtitle: 'Bring people together for movement and wellness in Bali.',
    eventTitleLabel: 'Activity title',
    eventTitlePlaceholder: 'e.g. Easy Morning 5K in Berawa',
    eventDescLabel: 'Description',
    eventDescPlaceholder: 'Share the vibe, pace, route, or what makes this meetup welcoming.',
    startTimeLabel: 'Start time',
    endTimeLabel: 'End time',
    locationModePlace: 'Pick from Places list',
    locationModePin: 'Pin custom spot on map',
    selectPlaceLabel: 'Choose a place',
    customLocationName: 'Location / meeting point name',
    customLocationPlaceholder: 'e.g. Batu Bolong Beach Parking',
    pinOnMapHint: 'Tap the mini-map below to drop the exact pin.',
    priceLabel: 'Ticket price (IDR, enter 0 for free)',
    maxSpotsLabel: 'Maximum participants',
    whatToBringLabel: 'What to bring',
    whatToBringPlaceholder: 'e.g. Water bottle, small towel, personal mat',
    coverImageLabel: 'Cover photo (optional)',
    uploadImageBtn: 'Upload photo',
    removeImageBtn: 'Remove photo',
    publishEventBtn: 'Publish Activity',
    eventCreatedToast: 'Activity published!',
    emptyEventsTitle: 'No matching activities',
    emptyEventsDesc: 'Try adjusting your filters or switching between Canggu and Ubud.',
    emptyPlacesTitle: 'No places found',
    emptyPlacesDesc: 'Try another search term or suggest a new place.',
    geocodingPins: (remaining: number) => `Resolving place pins (${remaining})...`,
    profileTitle: 'My Profile',
    myJoinedEvents: 'Joined Activities',
    myHostedEvents: 'Hosted Activities',
    mySavedPlaces: 'Saved Places',
    noJoinedYet: "You haven't joined any activities yet.",
    noHostedYet: "You haven't hosted any activities yet.",
    noSavedYet: "You haven't saved any places yet.",
    close: 'Close',
    back: 'Back',
    tapToExpand: 'Tap or drag up for full list',
  },
} as const;
