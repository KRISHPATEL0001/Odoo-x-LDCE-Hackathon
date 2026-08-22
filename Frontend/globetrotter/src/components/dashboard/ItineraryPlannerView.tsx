import React, { useState } from 'react';
import { Trip, DayItinerary, ActivityItem } from '../../types.ts';
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
    selectedTripId || (trips[0]?.id ?? 'trip-swiss-alps')
  );
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Local state for interactive itinerary days
  const [itineraryData, setItineraryData] = useState<Record<string, DayItinerary[]>>({
    'trip-swiss-alps': [
      {
        dayNumber: 1,
        date: 'May 12, 2025',
        theme: 'Arrival & Lake Promenade',
        activities: [
          {
            id: 'act-1',
            title: 'Check-in at Alpine Boutique Lodge',
            time: '14:00',
            location: 'Interlaken West',
            category: 'Relaxation',
            cost: 0,
            completed: true,
          },
          {
            id: 'act-2',
            title: 'Sunset Cruise on Lake Brienz',
            time: '17:30',
            location: 'Brienz Boat Station',
            category: 'Sightseeing',
            cost: 3200,
            completed: true,
          },
          {
            id: 'act-3',
            title: 'Authentic Swiss Fondue Dinner',
            time: '20:00',
            location: 'Restaurant Laterne',
            category: 'Dining',
            cost: 2500,
            completed: false,
          },
        ],
      },
      {
        dayNumber: 2,
        date: 'May 13, 2025',
        theme: 'Jungfraujoch – Top of Europe',
        activities: [
          {
            id: 'act-4',
            title: 'Cogwheel Train to Jungfraujoch Summit',
            time: '08:30',
            location: 'Kleine Scheidegg',
            category: 'Transport',
            cost: 8500,
            completed: false,
          },
          {
            id: 'act-5',
            title: 'Ice Palace & Glacier Plateau Exploration',
            time: '11:00',
            location: 'Jungfraujoch Peak',
            category: 'Sightseeing',
            cost: 0,
            completed: false,
          },
          {
            id: 'act-6',
            title: 'Panoramic Alpine Lunch at Crystal Restaurant',
            time: '13:30',
            location: 'Summit Lounge',
            category: 'Dining',
            cost: 3800,
            completed: false,
          },
        ],
      },
      {
        dayNumber: 3,
        date: 'May 14, 2025',
        theme: 'Lauterbrunnen Valley of 72 Waterfalls',
        activities: [
          {
            id: 'act-7',
            title: 'Staubbach & Trümmelbach Falls Trail',
            time: '09:30',
            location: 'Lauterbrunnen',
            category: 'Adventure',
            cost: 1400,
            completed: false,
          },
          {
            id: 'act-8',
            title: 'Cliff Walk at First Grindelwald',
            time: '15:00',
            location: 'Grindelwald First',
            category: 'Adventure',
            cost: 2900,
            completed: false,
          },
        ],
      },
    ],
    'trip-bali-getaway': [
      {
        dayNumber: 1,
        date: 'May 25, 2025',
        theme: 'Ubud Serenity & Monkey Forest',
        activities: [
          {
            id: 'b-1',
            title: 'Villa Check-in & Welcome Coconut',
            time: '13:00',
            location: 'Ubud Sanctuary',
            category: 'Relaxation',
            cost: 0,
            completed: true,
          },
          {
            id: 'b-2',
            title: 'Sacred Monkey Forest Sanctuary Walk',
            time: '15:30',
            location: 'Padangtegal, Ubud',
            category: 'Sightseeing',
            cost: 800,
            completed: false,
          },
        ],
      },
      {
        dayNumber: 2,
        date: 'May 26, 2025',
        theme: 'Mount Batur Sunrise & Hot Springs',
        activities: [
          {
            id: 'b-3',
            title: 'Early Jeep Trek for Sunrise',
            time: '04:00',
            location: 'Mount Batur Caldera',
            category: 'Adventure',
            cost: 3200,
            completed: false,
          },
          {
            id: 'b-4',
            title: 'Volcanic Natural Hot Springs Bath',
            time: '09:00',
            location: 'Toya Devasya',
            category: 'Relaxation',
            cost: 1200,
            completed: false,
          },
        ],
      },
    ],
  });

  // Modal / Form state for adding an activity
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<ActivityItem['category']>('Sightseeing');
  const [newCost, setNewCost] = useState<number>(1500);

  const currentTrip = trips.find((t) => t.id === activeTripId) || trips[0];
  const currentDays = itineraryData[activeTripId] || [
    {
      dayNumber: 1,
      date: currentTrip?.startDate || 'Day 1',
      theme: 'Arrival & Welcome Exploration',
      activities: [],
    },
  ];

  const activeDay = currentDays[activeDayIndex] || currentDays[0];

  const toggleActivityCompleted = (actId: string) => {
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
  };

  const deleteActivity = (actId: string) => {
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
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

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

    setNewTitle('');
    setNewLocation('');
    setShowAddModal(false);
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

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {currentDays.map((day, idx) => (
          <button
            key={day.dayNumber}
            onClick={() => setActiveDayIndex(idx)}
            className={`px-4 py-3 rounded-2xl text-left transition-all border shrink-0 cursor-pointer ${
              activeDayIndex === idx
                ? 'bg-[#5d6d5a] text-[#fdfcf8] border-[#5d6d5a] shadow-sm'
                : 'bg-[#fdfcf8] text-[#333533] border-[#e0e0d5] hover:bg-[#f5f5f0]'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">
              Day {day.dayNumber}
            </div>
            <div className="text-xs font-semibold truncate max-w-[140px]">
              {day.theme}
            </div>
          </button>
        ))}
      </div>

      {/* Active Day Timeline Card */}
      <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#e0e0d5] mb-6 gap-2">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#2d3436]">
              Day {activeDay.dayNumber}: {activeDay.theme}
            </h3>
            <p className="text-xs text-[#7f8c8d] mt-0.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#5d6d5a]" />
              <span>{activeDay.date}</span>
              <span>•</span>
              <span>{activeDay.activities.length} planned activities</span>
            </p>
          </div>

          <div className="text-xs bg-[#f5f5f0] px-3 py-1.5 rounded-xl border border-[#e0e0d5] text-[#2d3436] font-medium">
            Est. Day Cost:{' '}
            <span className="font-bold text-[#5d6d5a]">
              {currency}
              {activeDay.activities
                .reduce((acc, a) => acc + (a.cost || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>

        {/* Timeline Items List */}
        {activeDay.activities.length === 0 ? (
          <div className="py-12 text-center text-[#7f8c8d]">
            <Compass className="w-10 h-10 mx-auto text-[#d4a373] mb-2" />
            <p className="font-semibold text-sm text-[#2d3436]">No activities planned for this day yet.</p>
            <p className="text-xs mt-1">Click "Add Activity" to plan your morning, afternoon, or evening.</p>
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
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Interlaken Ost"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                  />
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
