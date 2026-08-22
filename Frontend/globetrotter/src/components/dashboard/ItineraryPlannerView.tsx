import React, { useState, useEffect, useRef } from 'react';
import { Trip, DayItinerary, ActivityItem, HotelRecommendation, RestaurantRecommendation, ReviewItem, PlaceToDiscover } from '../../types.ts';
import { api, PlaceItem } from '../../services/api.ts';
import {
  buildTripDaysSchedule,
  generateTripPhases,
  calculateTripDurationDays,
  TripPhase,
} from '../../utils/itineraryHelpers.ts';
import { WeatherWidget } from './WeatherWidget.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Circle,
  Tag,
  Compass,
  Trash2,
  Sparkles,
  Globe2,
  ExternalLink,
  Utensils,
  Building,
  Star,
  ShieldCheck,
  Check,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface ItineraryPlannerViewProps {
  trips: Trip[];
  selectedTripId?: string;
  currency: string;
}

export const ItineraryPlannerView: React.FC<ItineraryPlannerViewProps> = ({
  trips,
  selectedTripId,
  currency,
}) => {
  const [activeTripId, setActiveTripId] = useState<string>(
    selectedTripId || (trips[0]?.id ?? '')
  );
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('all');

  // Sync activeTripId with incoming selectedTripId or available trips
  useEffect(() => {
    if (selectedTripId) {
      setActiveTripId(selectedTripId);
      setActiveDayIndex(0);
      setSelectedPhaseId('all');
    } else if (trips.length > 0 && (!activeTripId || !trips.some((t) => t.id === activeTripId))) {
      setActiveTripId(trips[0].id);
      setActiveDayIndex(0);
      setSelectedPhaseId('all');
    }
  }, [selectedTripId, trips, activeTripId]);

  // Local state for interactive itinerary days (dynamic per trip)
  const [itineraryData, setItineraryData] = useState<Record<string, DayItinerary[]>>({});

  // Modal / Form state for adding an activity
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<ActivityItem['category']>('Sightseeing');
  const [newCost, setNewCost] = useState<number>(1500);

  // Places / Location autocomplete for activities
  const [locationResults, setLocationResults] = useState<PlaceItem[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationTimeoutRef = useRef<any>(null);

  // Nearby Facilities & Suggestions state
  const [nearbyHotels, setNearbyHotels] = useState<HotelRecommendation[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<RestaurantRecommendation[]>([]);
  const [nearbyAttractions, setNearbyAttractions] = useState<PlaceToDiscover[]>([]);
  const [destinationReviews, setDestinationReviews] = useState<ReviewItem[]>([]);
  const [addedSuggestions, setAddedSuggestions] = useState<Record<string, boolean>>({});

  const handleLocationChange = (val: string) => {
    setNewLocation(val);
    if (val.trim().length >= 2) {
      if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = setTimeout(async () => {
        try {
          const places = await api.searchPlaces(val.trim());
          setLocationResults(places);
          setShowLocationDropdown(true);
        } catch {
          setLocationResults([]);
        }
      }, 250);
    } else {
      setLocationResults([]);
      setShowLocationDropdown(false);
    }
  };

  // Fetch activities from backend on trip switch
  useEffect(() => {
    async function loadActivities() {
      if (activeTripId) {
        try {
          const fetched = await api.getActivities(activeTripId);
          const currentTrip = trips.find((t) => t.id === activeTripId);

          const days = buildTripDaysSchedule(currentTrip, fetched || []);
          setItineraryData((prev) => ({ ...prev, [activeTripId]: days }));
        } catch {
          const currentTrip = trips.find((t) => t.id === activeTripId);
          const days = buildTripDaysSchedule(currentTrip, []);
          setItineraryData((prev) => ({ ...prev, [activeTripId]: days }));
        }
      }
    }
    loadActivities();
  }, [activeTripId, trips]);

  if (trips.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
              Day-by-Day Schedule
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
              Interactive Itinerary Planner
            </h2>
            <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1 max-w-xl">
              Organize scheduled stops, timing, scenic highlights, and cost estimates day by day.
            </p>
          </div>
        </div>

        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#5d6d5a]/10 text-[#5d6d5a] flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-[#5d6d5a]" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2d3436] mb-1.5">
            No Itineraries to Display
          </h3>
          <p className="text-xs sm:text-sm text-[#7f8c8d] max-w-md">
            Create or schedule a trip first to map out your day-by-day stops, timing, and activities.
          </p>
        </div>
      </div>
    );
  }

  const currentTrip = trips.find((t) => t.id === activeTripId) || trips[0];
  const currentDays =
    itineraryData[activeTripId] && itineraryData[activeTripId].length > 0
      ? itineraryData[activeTripId]
      : buildTripDaysSchedule(currentTrip, []);

  const activeDay = currentDays[activeDayIndex] || currentDays[0] || {
    dayNumber: 1,
    date: currentTrip?.startDate || 'Day 1',
    theme: 'Arrival & Welcome Exploration',
    activities: [],
  };

  const tripPhases = generateTripPhases(currentDays.length);
  const currentPhase =
    tripPhases.find((p) => p.dayNumbers.includes(activeDay.dayNumber)) || tripPhases[0];

  const toggleActivityCompleted = async (actId: string) => {
    setItineraryData((prev) => {
      const tripDays = prev[activeTripId] ? [...prev[activeTripId]] : [...currentDays];
      const updatedDays = tripDays.map((day, idx) => {
        if (idx !== activeDayIndex) return day;
        return {
          ...day,
          activities: day.activities.map((a) =>
            a.id === actId ? { ...a, completed: !a.completed } : a
          ),
        };
      });
      return { ...prev, [activeTripId]: updatedDays };
    });
    await api.toggleActivity(actId);
  };

  const deleteActivity = async (actId: string) => {
    setItineraryData((prev) => {
      const tripDays = prev[activeTripId] ? [...prev[activeTripId]] : [...currentDays];
      const updatedDays = tripDays.map((day, idx) => {
        if (idx !== activeDayIndex) return day;
        return {
          ...day,
          activities: day.activities.filter((a) => a.id !== actId),
        };
      });
      return { ...prev, [activeTripId]: updatedDays };
    });
    await api.deleteActivity(actId);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const activityData = {
      title: newTitle.trim(),
      dayNumber: activeDay.dayNumber,
      time: newTime,
      location: newLocation.trim() || currentTrip.destination,
      category: newCategory,
      cost: Number(newCost) || 0,
    };

    try {
      const created = await api.createActivity(activeTripId, activityData);
      const newActivity: ActivityItem = created || {
        ...activityData,
        id: `custom-${Date.now()}`,
        completed: false,
      };

      setItineraryData((prev) => {
        const tripDays = prev[activeTripId] ? [...prev[activeTripId]] : [...currentDays];
        const updatedDays = tripDays.map((day, idx) => {
          if (idx !== activeDayIndex) return day;
          return {
            ...day,
            activities: [...day.activities, newActivity],
          };
        });
        return { ...prev, [activeTripId]: updatedDays };
      });
    } catch {
      const newActivity: ActivityItem = {
        id: `custom-${Date.now()}`,
        title: newTitle.trim(),
        time: newTime,
        location: newLocation.trim() || currentTrip.destination,
        category: newCategory,
        cost: Number(newCost) || 0,
        completed: false,
      };

      setItineraryData((prev) => {
        const tripDays = prev[activeTripId] ? [...prev[activeTripId]] : [...currentDays];
        const updatedDays = tripDays.map((day, idx) => {
          if (idx !== activeDayIndex) return day;
          return {
            ...day,
            activities: [...day.activities, newActivity],
          };
        });
        return { ...prev, [activeTripId]: updatedDays };
      });
    }

    setNewTitle('');
    setNewLocation('');
    setShowAddModal(false);
  };

  // Load nearby facilities & suggestions for current trip destination
  useEffect(() => {
    async function loadNearby() {
      if (currentTrip?.destination) {
        try {
          const aiPlan = await api.generateAIPlan({
            origin: 'My Location',
            destination: currentTrip.destination,
            durationDays: currentDays.length,
          });
          if (aiPlan) {
            setNearbyHotels(aiPlan.hotels || []);
            setNearbyRestaurants(aiPlan.restaurants || []);
            setNearbyAttractions(aiPlan.placesToDiscover || []);
            setDestinationReviews(aiPlan.reviews || []);
          }
        } catch {
          // fallback
        }
      }
    }
    loadNearby();
  }, [activeTripId, currentTrip?.destination]);

  const handleAddSuggestionToItinerary = async (
    title: string,
    category: ActivityItem['category'],
    cost: number,
    location: string,
    suggestKey: string
  ) => {
    const activityData = {
      title,
      dayNumber: activeDay.dayNumber,
      time: category === 'Dining' ? '13:00' : '11:00',
      location: location || currentTrip.destination,
      category,
      cost,
    };

    setAddedSuggestions((prev) => ({ ...prev, [suggestKey]: true }));

    try {
      const created = await api.createActivity(activeTripId, activityData);
      const newActivity: ActivityItem = created || {
        ...activityData,
        id: `custom-${Date.now()}`,
        completed: false,
      };

      setItineraryData((prev) => {
        const tripDays = prev[activeTripId] ? [...prev[activeTripId]] : [...currentDays];
        const updatedDays = tripDays.map((day, idx) => {
          if (idx !== activeDayIndex) return day;
          return {
            ...day,
            activities: [...day.activities, newActivity],
          };
        });
        return { ...prev, [activeTripId]: updatedDays };
      });
    } catch {
      // fallback
    }
  };

  const resolveTripCoordinates = (trip: Trip) => {
    if (trip.lat && trip.lon && trip.lat !== 35.67) {
      return { lat: trip.lat, lon: trip.lon };
    }
    const dest = (trip.destination || '').toLowerCase().trim();
    if (dest.includes('girnar') || dest.includes('junagadh')) {
      return { lat: 21.5273, lon: 70.5312 };
    }
    if (dest.includes('tokyo') || dest.includes('japan')) {
      return { lat: 35.6762, lon: 139.6503 };
    }
    if (dest.includes('paris') || dest.includes('france')) {
      return { lat: 48.8566, lon: 2.3522 };
    }
    if (dest.includes('manali') || dest.includes('himachal')) {
      return { lat: 32.2396, lon: 77.1887 };
    }
    if (dest.includes('bali') || dest.includes('indonesia')) {
      return { lat: -8.5069, lon: 115.2625 };
    }
    if (dest.includes('rome') || dest.includes('italy')) {
      return { lat: 41.9028, lon: 12.4964 };
    }
    if (dest.includes('london') || dest.includes('uk')) {
      return { lat: 51.5074, lon: -0.1278 };
    }
    if (dest.includes('swiss') || dest.includes('alps') || dest.includes('interlaken')) {
      return { lat: 46.6863, lon: 7.8632 };
    }
    return { lat: trip.lat || 21.5273, lon: trip.lon || 70.5312 };
  };

  const getGoogleMapsUrl = (trip: Trip) => {
    const coords = resolveTripCoordinates(trip);
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`;
  };

  const getStaticMapUrl = (trip: Trip) => {
    const coords = resolveTripCoordinates(trip);
    // English-only localized Google Maps embed
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lon}&hl=en&z=12&output=embed`;
  };

  const getCategoryColor = (cat: ActivityItem['category']) => {
    switch (cat) {
      case 'Adventure':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Dining':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'Transport':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      case 'Relaxation':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      default:
        return 'bg-[#5d6d5a]/15 text-[#5d6d5a] border-[#5d6d5a]/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with trip selector */}
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#d4a373]" />
            Day-by-Day Journey Planner
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
            {currentTrip ? currentTrip.title : 'Trip Itinerary'} {currentTrip?.flag}
          </h2>
          <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1">
            Organize times, sightseeing spots, reservations, and activities.
          </p>
        </div>

        {/* Trip Switcher Dropdown */}
        <div className="w-full md:w-auto flex items-center gap-3">
          <select
            value={activeTripId}
            onChange={(e) => {
              setActiveTripId(e.target.value);
              setActiveDayIndex(0);
            }}
            className="px-4 py-2.5 bg-white border border-[#e0e0d5] rounded-xl text-sm font-semibold text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag} {t.title} ({t.destination})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Top Info Grid: Weather Widget + Static Map Preview with Google Maps */}
      {currentTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <WeatherWidget
              locationName={currentTrip.destination}
              lat={currentTrip.lat}
              lon={currentTrip.lon}
            />
          </div>

          {/* Non-interactive Destination Map Card with Open in Google Maps */}
          <div className="lg:col-span-5 bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5d6d5a]">
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Destination Map Preview</span>
                </div>
                <span className="text-[10px] font-semibold text-[#7f8c8d] bg-[#f5f5f0] px-2 py-0.5 rounded-full border border-[#e0e0d5]">
                  Static Preview
                </span>
              </div>

              <h4 className="font-serif font-bold text-base text-[#2d3436] mb-2 flex items-center gap-1.5">
                <span>{currentTrip.destination}</span>
                <span>{currentTrip.flag}</span>
              </h4>

              {/* Map Preview Frame (Non-interactive) */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-[#e0e0d5] bg-[#eaeae0] mb-3">
                <iframe
                  title="Destination Map Preview"
                  src={getStaticMapUrl(currentTrip)}
                  className="w-full h-full border-0 pointer-events-none select-none"
                  loading="lazy"
                  tabIndex={-1}
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#d4a373]" />
                  <span>Map Preview</span>
                </div>
              </div>
            </div>

            {/* Prominent Google Maps Action Button */}
            <a
              href={getGoogleMapsUrl(currentTrip)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>Open {currentTrip.destination} in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
        </div>
      )}

      {/* Multi-Phase / Day Sets Navigator for Journeys */}
      {tripPhases.length > 1 && (
        <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5d6d5a]">
            <Layers className="w-4 h-4 text-[#d4a373]" />
            <span>Journey Day Sets ({currentDays.length} Days Total):</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedPhaseId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPhaseId === 'all'
                  ? 'bg-[#5d6d5a] text-white shadow-xs'
                  : 'bg-white text-[#2d3436] hover:bg-[#eaeae0] border border-[#e0e0d5]'
              }`}
            >
              All Days ({currentDays.length})
            </button>
            {tripPhases.map((phase) => (
              <button
                key={phase.id}
                type="button"
                onClick={() => {
                  setSelectedPhaseId(phase.id);
                  const targetIdx = currentDays.findIndex((d) => d.dayNumber === phase.dayStart);
                  if (targetIdx !== -1) setActiveDayIndex(targetIdx);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  selectedPhaseId === phase.id ||
                  (selectedPhaseId === 'all' && currentPhase.id === phase.id)
                    ? 'bg-[#5d6d5a] text-white shadow-xs'
                    : 'bg-white text-[#2d3436] hover:bg-[#eaeae0] border border-[#e0e0d5]'
                }`}
                title={phase.theme}
              >
                <span>{phase.emoji}</span>
                <span>{phase.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {currentDays.map((day, idx) => {
          const dayPhase = tripPhases.find((p) => p.dayNumbers.includes(day.dayNumber));
          const isSelected = activeDayIndex === idx;

          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-4 py-3 rounded-2xl text-left transition-all border shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#5d6d5a] text-[#fdfcf8] border-[#5d6d5a] shadow-sm'
                  : 'bg-[#fdfcf8] text-[#333533] border-[#e0e0d5] hover:bg-[#f5f5f0]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold">
                  Day {day.dayNumber}
                </span>
                {dayPhase && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#5d6d5a]/10 text-[#5d6d5a]'
                    }`}
                  >
                    {dayPhase.shortLabel}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold truncate max-w-[140px]">{day.theme}</div>
              <div
                className={`text-[10px] truncate mt-0.5 ${
                  isSelected ? 'text-white/80' : 'text-[#7f8c8d]'
                }`}
              >
                {day.date}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Timeline Card */}
      <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#e0e0d5] mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#5d6d5a]/10 text-[#5d6d5a] border border-[#5d6d5a]/20 uppercase tracking-wider flex items-center gap-1">
                <span>{currentPhase.emoji}</span>
                <span>{currentPhase.name}</span>
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2d3436]">
              Day {activeDay.dayNumber}: {activeDay.theme}
            </h3>
            <p className="text-xs text-[#7f8c8d] mt-0.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#5d6d5a]" />
              <span className="font-semibold text-[#2d3436]">{activeDay.date}</span>
              <span>•</span>
              <span>{activeDay.activities.length} planned activities</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-xs bg-[#f5f5f0] px-3 py-2 rounded-xl border border-[#e0e0d5] text-[#2d3436] font-medium">
              Est. Day Cost:{' '}
              <span className="font-bold text-[#5d6d5a]">
                {currency}
                {activeDay.activities
                  .reduce((acc, a) => acc + (a.cost || 0), 0)
                  .toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
              title="Add activity to this day"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Activity</span>
            </button>
          </div>
        </div>

        {/* Timeline Items List */}
        {activeDay.activities.length === 0 ? (
          <div className="py-12 text-center text-[#7f8c8d]">
            <Compass className="w-12 h-12 mx-auto text-[#d4a373] mb-3" />
            <p className="font-serif font-bold text-base text-[#2d3436]">No activities planned for Day {activeDay.dayNumber} yet.</p>
            <p className="text-xs mt-1 text-[#7f8c8d]">Plan your morning sightseeing, afternoon dining, or evening experiences.</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Activity to Day {activeDay.dayNumber}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:top-3 before:bottom-3 before:left-4.5 before:w-0.5 before:bg-[#e0e0d5]">
            {activeDay.activities.map((act) => (
              <div
                key={act.id}
                className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  act.completed
                    ? 'bg-[#f5f5f0]/60 border-[#e0e0d5] opacity-75'
                    : 'bg-white border-[#e0e0d5] hover:border-[#5d6d5a]/50 shadow-xs'
                }`}
              >
                {/* Checkbox button */}
                <button
                  type="button"
                  onClick={() => toggleActivityCompleted(act.id)}
                  className="mt-0.5 z-10 text-[#5d6d5a] hover:scale-110 transition-transform cursor-pointer"
                  title={act.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {act.completed ? (
                    <CheckCircle2 className="w-5 h-5 fill-[#5d6d5a] text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#7f8c8d]" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5d6d5a] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.time}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(
                          act.category
                        )}`}
                      >
                        {act.category}
                      </span>
                    </div>

                    {act.cost > 0 && (
                      <span className="text-xs font-bold text-[#2d3436]">
                        {currency}
                        {act.cost.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <h4
                    className={`font-semibold text-sm text-[#2d3436] ${
                      act.completed ? 'line-through text-[#7f8c8d]' : ''
                    }`}
                  >
                    {act.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-[#7f8c8d] mt-1">
                    <MapPin className="w-3 h-3 text-[#d4a373]" />
                    <span>{act.location}</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteActivity(act.id)}
                  className="p-1.5 text-[#7f8c8d] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post-Trip Nearby Facilities & Exploration Suggestions */}
      {currentTrip && (
        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#e0e0d5] gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5d6d5a] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
                <span>Nearby Facilities &amp; Exploration Guide</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2d3436]">
                Explore Facilities &amp; Stops around {currentTrip.destination}
              </h3>
              <p className="text-xs text-[#7f8c8d] mt-0.5">
                Handpicked restaurants, attractions, and hotels with 1-click addition to Day {activeDay.dayNumber}.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#5d6d5a] bg-[#5d6d5a]/10 px-3 py-1 rounded-full">
              Live Suggestions for Day {activeDay.dayNumber}
            </span>
          </div>

          {/* 1. Recommended Dining */}
          {nearbyRestaurants.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <h4 className="font-serif font-bold text-base text-[#2d3436] flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#d4a373]" />
                  <span>Nearby Restaurants &amp; Culinary Hotspots</span>
                </h4>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=restaurants+near+${encodeURIComponent(
                    currentTrip.destination
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] rounded-xl text-xs font-semibold text-[#5d6d5a] shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Explore All Restaurants on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nearbyRestaurants.map((rest, idx) => {
                  const key = `rest-${idx}-${rest.name}`;
                  const isAdded = addedSuggestions[key];
                  const mapUrl =
                    rest.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      rest.name + ', ' + currentTrip.destination
                    )}`;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#f5f5f0] border border-[#e0e0d5] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                            {rest.cuisine}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#2d3436]">
                            <Star className="w-3 h-3 text-[#d4a373] fill-[#d4a373]" />
                            <span>{rest.rating}</span>
                          </div>
                        </div>

                        <h5 className="font-bold text-sm text-[#2d3436]">{rest.name}</h5>
                        <div className="text-[11px] text-[#7f8c8d] flex items-center gap-1 mt-0.5 mb-2">
                          <MapPin className="w-3 h-3 text-[#d4a373]" />
                          <span>{rest.neighborhood}</span>
                        </div>

                        <div className="p-2 rounded-xl bg-white text-[11px] text-[#2d3436] mb-3">
                          🍽️ <strong>Must-Try:</strong> {rest.mustTry}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() =>
                            handleAddSuggestionToItinerary(
                              `Lunch/Dinner at ${rest.name}`,
                              'Dining',
                              rest.priceLevel === '$$$$' ? 4000 : 1800,
                              `${rest.name}, ${rest.neighborhood}`,
                              key
                            )
                          }
                          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-[#5d6d5a] hover:bg-[#4a5748] text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added to Day {activeDay.dayNumber}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add to Day {activeDay.dayNumber}</span>
                            </>
                          )}
                        </button>

                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-3 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] text-[#2d3436] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-[#d4a373]" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Places & Attractions to Discover */}
          {nearbyAttractions.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <h4 className="font-serif font-bold text-base text-[#2d3436] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#d4a373]" />
                  <span>Nearby Sights &amp; Places to Discover</span>
                </h4>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=things+to+do+near+${encodeURIComponent(
                    currentTrip.destination
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] rounded-xl text-xs font-semibold text-[#5d6d5a] shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Explore All Attractions on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nearbyAttractions.map((place, idx) => {
                  const key = `place-${idx}-${place.name}`;
                  const isAdded = addedSuggestions[key];
                  const mapUrl =
                    place.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      place.name + ', ' + currentTrip.destination
                    )}`;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#f5f5f0] border border-[#e0e0d5] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                            {place.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#2d3436]">
                            <Star className="w-3 h-3 text-[#d4a373] fill-[#d4a373]" />
                            <span>{place.rating}</span>
                          </div>
                        </div>

                        <h5 className="font-bold text-sm text-[#2d3436]">{place.name}</h5>
                        <div className="text-[11px] text-[#7f8c8d] flex items-center gap-1 mt-0.5 mb-2">
                          <Clock className="w-3 h-3 text-[#5d6d5a]" />
                          <span>{place.time}</span>
                        </div>

                        <p className="text-[11px] text-[#7f8c8d] line-clamp-2 mb-3 leading-relaxed">
                          {place.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() =>
                            handleAddSuggestionToItinerary(
                              place.name,
                              'Sightseeing',
                              2000,
                              place.name,
                              key
                            )
                          }
                          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-[#5d6d5a] hover:bg-[#4a5748] text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added to Day {activeDay.dayNumber}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add Stop to Day {activeDay.dayNumber}</span>
                            </>
                          )}
                        </button>

                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-3 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] text-[#2d3436] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-[#d4a373]" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Nearby Hotels & Stays */}
          {nearbyHotels.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <h4 className="font-serif font-bold text-base text-[#2d3436] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#d4a373]" />
                  <span>Nearby Accommodations &amp; Hotels</span>
                </h4>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=hotels+near+${encodeURIComponent(
                    currentTrip.destination
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] rounded-xl text-xs font-semibold text-[#5d6d5a] shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Explore All Hotels on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {nearbyHotels.map((hotel, idx) => {
                  const mapUrl =
                    hotel.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      hotel.name + ', ' + (hotel.area || currentTrip.destination)
                    )}`;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#f5f5f0] border border-[#e0e0d5] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold uppercase">
                            {hotel.tier}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#2d3436]">
                            <Star className="w-3 h-3 text-[#d4a373] fill-[#d4a373]" />
                            <span>{hotel.rating}</span>
                          </div>
                        </div>

                        <h5 className="font-bold text-sm text-[#2d3436]">{hotel.name}</h5>
                        <div className="text-[11px] text-[#7f8c8d] flex items-center gap-1 mt-0.5 mb-2">
                          <MapPin className="w-3 h-3 text-[#5d6d5a]" />
                          <span>{hotel.area}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {hotel.amenities.slice(0, 2).map((am, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white text-[9px] text-[#2d3436]">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#e0e0d5] flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2d3436]">
                            {currency}{hotel.pricePerNight.toLocaleString()}/nt
                          </span>
                          <span className="text-[10px] text-[#7f8c8d]">Verified Stay</span>
                        </div>

                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-3 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] text-[#2d3436] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-[#d4a373]" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Verified Traveler Reviews */}
          {destinationReviews.length > 0 && (
            <div className="pt-2 border-t border-[#e0e0d5]">
              <h4 className="font-serif font-bold text-sm text-[#2d3436] mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Traveler Reviews for {currentTrip.destination}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {destinationReviews.map((rev, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#e0e0d5] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#2d3436]">{rev.author} ({rev.location})</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-[#d4a373] fill-[#d4a373]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#7f8c8d] italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-[#2d3436] mb-1">
              Add Itinerary Activity
            </h3>
            <p className="text-xs text-[#7f8c8d] mb-4">
              Add a new stop or reservation for Day {activeDay.dayNumber}.
            </p>

            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Paragliding over Lake Thun"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as ActivityItem['category'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Dining">Dining</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Transport">Transport</option>
                    <option value="Relaxation">Relaxation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1 flex items-center justify-between">
                    <span>Location / Landmark</span>
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="e.g. Interlaken Ost"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                  />

                  {showLocationDropdown && locationResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e0d5] rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto">
                      {locationResults.map((place) => (
                        <div
                          key={place.id}
                          onClick={() => {
                            setNewLocation(`${place.name}, ${place.country}`);
                            setShowLocationDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-[#f5f5f0] cursor-pointer flex items-center justify-between text-xs border-b border-[#e0e0d5]/30 last:border-0"
                        >
                          <span className="flex items-center gap-1.5 font-medium text-[#2d3436]">
                            <span>{place.flag}</span>
                            <span>{place.name}</span>
                          </span>
                          <span className="text-[10px] text-[#7f8c8d]">{place.country}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                    Est. Cost ({currency})
                  </label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e0e0d5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7f8c8d] hover:bg-[#f5f5f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-xs font-semibold shadow-sm"
                >
                  Add to Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
