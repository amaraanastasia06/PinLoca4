import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { CreateEventModal } from './components/CreateEventModal';
import { EventCard } from './components/EventCard';
import { EventDetailSheet } from './components/EventDetailSheet';
import { EventFiltersBar } from './components/EventFiltersBar';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { MobileNav } from './components/MobileNav';
import { PlaceDetailSheet } from './components/PlaceDetailSheet';
import { PlacesTab } from './components/PlacesTab';
import { SuggestPlaceModal } from './components/SuggestPlaceModal';
import { SEED_PLACES, createSeedEvents } from './data/seed';
import {
  TRANSLATIONS,
  addDaysToDateString,
  getTimeOfDayFromTime,
  getTodayDateString,
} from './i18n';
import {
  ActivityEvent,
  AreaName,
  CachedPlaceCoords,
  EventFilters,
  Language,
  Place,
  PlaceCategory,
  PlaceFilters,
  User,
} from './types';
import { AREA_CENTERS, BALI_OVERVIEW_CENTER, geocodeMissingPlacesQueue } from './utils/geo';
import {
  loadEvents,
  loadFavoritePlaceIds,
  loadLanguage,
  loadPlaceCoordsCache,
  loadSuggestedPlaces,
  loadUser,
  saveEvents,
  saveFavoritePlaceIds,
  saveLanguage,
  saveSuggestedPlaces,
  saveUser,
} from './utils/storage';

const DEFAULT_EVENT_FILTERS: EventFilters = {
  category: 'all',
  dateOption: 'all',
  customDate: getTodayDateString(),
  timeOfDay: 'all',
  price: 'all',
  level: 'all',
  touristFriendlyOnly: false,
  area: 'all',
};

const DEFAULT_PLACE_FILTERS: PlaceFilters = {
  search: '',
  category: 'all',
  area: 'all',
  sortBy: 'alphabetical',
  favoritesOnly: false,
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => loadLanguage());
  const t = TRANSLATIONS[lang];

  const [user, setUser] = useState<User | null>(() => loadUser());
  const [events, setEvents] = useState<ActivityEvent[]>(() => loadEvents(createSeedEvents()));
  const [suggestedPlaces, setSuggestedPlaces] = useState<Place[]>(() => loadSuggestedPlaces());
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>(() =>
    loadFavoritePlaceIds()
  );
  const [coordsCache, setCoordsCache] = useState<Record<string, CachedPlaceCoords>>(() =>
    loadPlaceCoordsCache()
  );
  const [geocodingRemaining, setGeocodingRemaining] = useState(0);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'explore' | 'places'>('explore');
  const [eventFilters, setEventFilters] = useState<EventFilters>(DEFAULT_EVENT_FILTERS);
  const [placeFilters, setPlaceFilters] = useState<PlaceFilters>(DEFAULT_PLACE_FILTERS);

  // Map Layer States
  const [showEventsLayer, setShowEventsLayer] = useState(true);
  const [showPlacesLayer, setShowPlacesLayer] = useState(false);
  const [placeSubFilter, setPlaceSubFilter] = useState<PlaceCategory | 'all'>('all');
  const [activeArea, setActiveArea] = useState<AreaName | 'all'>('all');
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
    nonce: number;
  } | null>(null);

  const [selectedPin, setSelectedPin] = useState<
    { type: 'event'; item: ActivityEvent } | { type: 'place'; item: Place } | null
  >(null);

  // Detail & Modal States
  const [detailEventId, setDetailEventId] = useState<string | null>(null);
  const [detailPlaceId, setDetailPlaceId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInitialPlace, setCreateInitialPlace] = useState<Place | null>(null);
  const [showSuggestPlaceModal, setShowSuggestPlaceModal] = useState(false);

  // Pending action after login (e.g., clicked Create or Join while signed out)
  const pendingPostLoginAction = useRef<(() => void) | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Merge seed places + suggested places + cached geocoded coordinates
  const allPlaces = useMemo<Place[]>(() => {
    const merged = [...SEED_PLACES, ...suggestedPlaces];
    return merged.map((p) => {
      if (typeof p.lat === 'number' && typeof p.lng === 'number') {
        return p;
      }
      const cached = coordsCache[p.id];
      if (cached) {
        return {
          ...p,
          lat: cached.lat,
          lng: cached.lng,
          isApproximate: cached.isApproximate,
        };
      }
      return p;
    });
  }, [suggestedPlaces, coordsCache]);

  // Run Nominatim geocoding queue for places missing lat/lng (1 req/sec, cached in localStorage)
  useEffect(() => {
    const controller = new AbortController();
    const rawPlaces = [...SEED_PLACES, ...suggestedPlaces];

    geocodeMissingPlacesQueue(
      rawPlaces,
      (placeId, coords) => {
        setCoordsCache((prev) => ({
          ...prev,
          [placeId]: coords,
        }));
      },
      (remaining) => {
        setGeocodingRemaining(remaining);
      },
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [suggestedPlaces]);

  // Handle share link query params on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedEventId = params.get('event');
    const sharedPlaceId = params.get('place');
    if (sharedEventId && events.some((e) => e.id === sharedEventId)) {
      setDetailEventId(sharedEventId);
    } else if (sharedPlaceId) {
      setDetailPlaceId(sharedPlaceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const today = getTodayDateString();
    const tomorrow = addDaysToDateString(today, 1);
    const weekEnd = addDaysToDateString(today, 6);

    return events
      .filter((evt) => {
        if (eventFilters.area !== 'all' && evt.area !== eventFilters.area) return false;
        if (eventFilters.category !== 'all' && evt.category !== eventFilters.category)
          return false;

        if (eventFilters.dateOption === 'today' && evt.date !== today) return false;
        if (eventFilters.dateOption === 'tomorrow' && evt.date !== tomorrow) return false;
        if (
          eventFilters.dateOption === 'week' &&
          (evt.date < today || evt.date > weekEnd)
        ) {
          return false;
        }
        if (
          eventFilters.dateOption === 'custom' &&
          eventFilters.customDate &&
          evt.date !== eventFilters.customDate
        ) {
          return false;
        }

        if (
          eventFilters.timeOfDay !== 'all' &&
          getTimeOfDayFromTime(evt.startTime) !== eventFilters.timeOfDay
        ) {
          return false;
        }

        if (eventFilters.price === 'free' && evt.price > 0) return false;
        if (eventFilters.price === 'paid' && evt.price === 0) return false;

        if (eventFilters.level !== 'all' && evt.level !== eventFilters.level) return false;
        if (eventFilters.touristFriendlyOnly && !evt.touristFriendly) return false;

        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [events, eventFilters]);

  const detailEvent = useMemo(
    () => events.find((e) => e.id === detailEventId) || null,
    [events, detailEventId]
  );

  const detailPlace = useMemo(
    () => allPlaces.find((p) => p.id === detailPlaceId) || null,
    [allPlaces, detailPlaceId]
  );

  // Handlers
  const handleToggleLang = (next: Language) => {
    setLang(next);
    saveLanguage(next);
  };

  const handleSelectArea = (area: AreaName | 'all') => {
    setActiveArea(area);
    setEventFilters((prev) => ({ ...prev, area }));
    if (area === 'all') {
      setFlyToTarget({
        lat: BALI_OVERVIEW_CENTER.lat,
        lng: BALI_OVERVIEW_CENTER.lng,
        zoom: BALI_OVERVIEW_CENTER.zoom,
        nonce: Date.now(),
      });
    } else {
      const target = AREA_CENTERS[area];
      setFlyToTarget({
        lat: target.lat,
        lng: target.lng,
        zoom: target.zoom,
        nonce: Date.now(),
      });
    }
  };

  const handleSignIn = (name: string, phone: string) => {
    const newUser: User = {
      id: `user-${phone.replace(/\D/g, '') || Date.now()}`,
      name,
      phone,
    };
    setUser(newUser);
    saveUser(newUser);
    setShowAuthModal(false);

    if (pendingPostLoginAction.current) {
      const action = pendingPostLoginAction.current;
      pendingPostLoginAction.current = null;
      action();
    }
  };

  const handleSignOut = () => {
    setUser(null);
    saveUser(null);
    setShowAuthModal(false);
  };

  const handleOpenCreate = (prefillPlace: Place | null = null) => {
    if (!user) {
      pendingPostLoginAction.current = () => {
        setCreateInitialPlace(prefillPlace);
        setShowCreateModal(true);
      };
      setShowAuthModal(true);
      return;
    }
    setCreateInitialPlace(prefillPlace);
    setShowCreateModal(true);
  };

  const performToggleJoin = (evt: ActivityEvent, activeUser: User) => {
    const alreadyJoined = evt.attendees.some((a) => a.id === activeUser.id);
    if (!alreadyJoined && evt.attendees.length >= evt.maxSpots) return;

    const initials = activeUser.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const updated = events.map((item) => {
      if (item.id !== evt.id) return item;
      if (alreadyJoined) {
        return {
          ...item,
          attendees: item.attendees.filter((a) => a.id !== activeUser.id),
        };
      }
      return {
        ...item,
        attendees: [
          ...item.attendees,
          {
            id: activeUser.id,
            name: activeUser.name,
            initials: initials || 'PL',
            color: '#0F9D8A',
          },
        ],
      };
    });

    setEvents(updated);
    saveEvents(updated);
    showToast(alreadyJoined ? t.leftToast : t.joinedToast);
  };

  const handleToggleJoin = (evt: ActivityEvent) => {
    if (!user) {
      pendingPostLoginAction.current = () => {
        const freshUser = loadUser();
        if (freshUser) {
          performToggleJoin(evt, freshUser);
        }
      };
      setShowAuthModal(true);
      return;
    }
    performToggleJoin(evt, user);
  };

  const handleCreateEvent = (newEvent: ActivityEvent) => {
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveEvents(updated);
    setShowCreateModal(false);
    setCreateInitialPlace(null);
    setActiveTab('explore');
    setShowEventsLayer(true);
    setSelectedPin({ type: 'event', item: newEvent });
    setFlyToTarget({ lat: newEvent.lat, lng: newEvent.lng, zoom: 15, nonce: Date.now() });
    showToast(t.eventCreatedToast);
  };

  const handleToggleFavoritePlace = (placeId: string) => {
    setFavoritePlaceIds((prev) => {
      const next = prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId];
      saveFavoritePlaceIds(next);
      return next;
    });
  };

  const handleSuggestPlace = (newPlace: Place) => {
    const updated = [newPlace, ...suggestedPlaces];
    setSuggestedPlaces(updated);
    saveSuggestedPlaces(updated);
    setShowSuggestPlaceModal(false);
    setShowPlacesLayer(true);
    showToast(t.placeSuggestedToast);
  };

  const handleShareEvent = async (evt: ActivityEvent) => {
    const url = `${window.location.origin}${window.location.pathname}?event=${encodeURIComponent(
      evt.id
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t.linkCopied);
    } catch {
      showToast(t.linkCopied);
    }
  };

  const handleSelectEventFromList = (evt: ActivityEvent) => {
    setSelectedPin({ type: 'event', item: evt });
    setFlyToTarget({ lat: evt.lat, lng: evt.lng, zoom: 15, nonce: Date.now() });
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAF7] text-[#1F2937] overflow-hidden">
      {/* Top Navigation Bar */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'places') {
            setShowPlacesLayer(true);
          }
        }}
        onOpenCreate={() => handleOpenCreate(null)}
        user={user}
        onOpenAuthOrProfile={() => setShowAuthModal(true)}
      />

      {/* Main Split Workspace */}
      <main className="flex-1 flex min-h-0 relative">
        {/* Desktop Left Side Panel */}
        <aside className="hidden lg:flex lg:w-[440px] xl:w-[470px] shrink-0 flex-col bg-[#FAFAF7] border-r border-gray-200/90 min-h-0">
          {activeTab === 'explore' ? (
            <>
              <div className="p-4 border-b border-gray-200/80 bg-white space-y-3">
                <div>
                  <h1 className="text-lg font-extrabold text-[#1F2937] tracking-tight">
                    {t.tagline}
                  </h1>
                </div>

                <EventFiltersBar
                  lang={lang}
                  filters={eventFilters}
                  onChange={setEventFilters}
                  onReset={() => {
                    setEventFilters(DEFAULT_EVENT_FILTERS);
                    handleSelectArea('all');
                  }}
                  resultCount={filteredEvents.length}
                />
              </div>

              <div className="flex-1 overflow-y-auto pinloca-scroll p-4 space-y-3">
                {filteredEvents.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-gray-200/80 p-6 text-center space-y-2">
                    <p className="text-base font-bold text-[#1F2937]">{t.emptyEventsTitle}</p>
                    <p className="text-xs text-gray-500">{t.emptyEventsDesc}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setEventFilters(DEFAULT_EVENT_FILTERS);
                        handleSelectArea('all');
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#0F9D8A] text-white text-xs font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.resetFilter}</span>
                    </button>
                  </div>
                ) : (
                  filteredEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      lang={lang}
                      isSelected={
                        selectedPin?.type === 'event' && selectedPin.item.id === evt.id
                      }
                      onSelect={handleSelectEventFromList}
                      onOpenDetail={(e) => setDetailEventId(e.id)}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <PlacesTab
              lang={lang}
              places={allPlaces}
              favoritePlaceIds={favoritePlaceIds}
              filters={placeFilters}
              onChangeFilters={setPlaceFilters}
              onToggleFavorite={handleToggleFavoritePlace}
              onOpenPlaceDetail={(place) => {
                setDetailPlaceId(place.id);
                if (typeof place.lat === 'number' && typeof place.lng === 'number') {
                  setFlyToTarget({
                    lat: place.lat,
                    lng: place.lng,
                    zoom: 15,
                    nonce: Date.now(),
                  });
                }
              }}
              onOpenSuggestPlace={() => setShowSuggestPlaceModal(true)}
            />
          )}
        </aside>

        {/* Map Canvas (Always visible on Desktop; Fullscreen on Mobile Explore tab) */}
        <div
          className={`flex-1 relative min-h-0 ${
            activeTab === 'places' ? 'hidden lg:block' : 'block'
          }`}
        >
          <MapCanvas
            lang={lang}
            events={filteredEvents}
            places={allPlaces}
            showEventsLayer={showEventsLayer}
            onToggleEventsLayer={() => setShowEventsLayer((v) => !v)}
            showPlacesLayer={showPlacesLayer}
            onTogglePlacesLayer={() => setShowPlacesLayer((v) => !v)}
            placeSubFilter={placeSubFilter}
            onChangePlaceSubFilter={setPlaceSubFilter}
            activeArea={activeArea}
            onSelectArea={handleSelectArea}
            selectedPin={selectedPin}
            onSelectPin={setSelectedPin}
            onOpenEventDetail={(evt) => setDetailEventId(evt.id)}
            onOpenPlaceDetail={(place) => setDetailPlaceId(place.id)}
            geocodingRemaining={geocodingRemaining}
            flyToTarget={flyToTarget}
          />
        </div>

        {/* Mobile Places Tab View */}
        {activeTab === 'places' && (
          <div className="lg:hidden flex-1 bg-[#FAFAF7] min-h-0 flex flex-col">
            <PlacesTab
              lang={lang}
              places={allPlaces}
              favoritePlaceIds={favoritePlaceIds}
              filters={placeFilters}
              onChangeFilters={setPlaceFilters}
              onToggleFavorite={handleToggleFavoritePlace}
              onOpenPlaceDetail={(place) => setDetailPlaceId(place.id)}
              onOpenSuggestPlace={() => setShowSuggestPlaceModal(true)}
            />
          </div>
        )}

        {/* Mobile Draggable Bottom Sheet on Explore Tab */}
        {activeTab === 'explore' && (
          <MobileBottomSheet
            lang={lang}
            headerTitle={t.resultsEvents(filteredEvents.length)}
          >
            <EventFiltersBar
              lang={lang}
              filters={eventFilters}
              onChange={setEventFilters}
              onReset={() => {
                setEventFilters(DEFAULT_EVENT_FILTERS);
                handleSelectArea('all');
              }}
              resultCount={filteredEvents.length}
            />

            {filteredEvents.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-200/80 p-5 text-center space-y-2">
                <p className="text-sm font-bold text-[#1F2937]">{t.emptyEventsTitle}</p>
                <p className="text-xs text-gray-500">{t.emptyEventsDesc}</p>
                <button
                  type="button"
                  onClick={() => {
                    setEventFilters(DEFAULT_EVENT_FILTERS);
                    handleSelectArea('all');
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#0F9D8A] text-white text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetFilter}</span>
                </button>
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  lang={lang}
                  isSelected={
                    selectedPin?.type === 'event' && selectedPin.item.id === evt.id
                  }
                  onSelect={handleSelectEventFromList}
                  onOpenDetail={(e) => setDetailEventId(e.id)}
                />
              ))
            )}
          </MobileBottomSheet>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNav
        lang={lang}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'places') setShowPlacesLayer(true);
        }}
        onOpenCreate={() => handleOpenCreate(null)}
        onOpenAuthOrProfile={() => setShowAuthModal(true)}
        user={user}
      />

      {/* Event Detail Sheet */}
      {detailEvent && (
        <EventDetailSheet
          event={detailEvent}
          lang={lang}
          places={allPlaces}
          currentUser={user}
          onClose={() => setDetailEventId(null)}
          onToggleJoin={handleToggleJoin}
          onOpenPlace={(place) => {
            setDetailEventId(null);
            setDetailPlaceId(place.id);
          }}
          onShare={handleShareEvent}
        />
      )}

      {/* Place Detail Sheet */}
      {detailPlace && (
        <PlaceDetailSheet
          place={detailPlace}
          lang={lang}
          events={events}
          isFavorite={favoritePlaceIds.includes(detailPlace.id)}
          onToggleFavorite={handleToggleFavoritePlace}
          onCreateEventHere={(place) => {
            setDetailPlaceId(null);
            handleOpenCreate(place);
          }}
          onOpenEvent={(evt) => {
            setDetailPlaceId(null);
            setDetailEventId(evt.id);
          }}
          onClose={() => setDetailPlaceId(null)}
        />
      )}

      {/* Create Event Modal */}
      {showCreateModal && user && (
        <CreateEventModal
          lang={lang}
          user={user}
          places={allPlaces}
          initialPlace={createInitialPlace}
          onClose={() => {
            setShowCreateModal(false);
            setCreateInitialPlace(null);
          }}
          onCreate={handleCreateEvent}
        />
      )}

      {/* Suggest Place Modal */}
      {showSuggestPlaceModal && (
        <SuggestPlaceModal
          lang={lang}
          onClose={() => setShowSuggestPlaceModal(false)}
          onSubmit={handleSuggestPlace}
        />
      )}

      {/* Auth / Profile Modal */}
      {showAuthModal && (
        <AuthModal
          lang={lang}
          user={user}
          events={events}
          places={allPlaces}
          favoritePlaceIds={favoritePlaceIds}
          onClose={() => {
            pendingPostLoginAction.current = null;
            setShowAuthModal(false);
          }}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onOpenEvent={(evt) => {
            setShowAuthModal(false);
            setDetailEventId(evt.id);
          }}
          onOpenPlace={(place) => {
            setShowAuthModal(false);
            setDetailPlaceId(place.id);
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-2xl bg-[#1F2937] text-white text-xs font-bold shadow-xl pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
