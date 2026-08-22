import React, { useState, useEffect, useRef } from 'react';
import { Trip, Destination } from '../../types.ts';
import { api, PlaceItem } from '../../services/api.ts';
import { parseDateSafe, formatDateReadable, calculateTripDurationDays } from '../../utils/itineraryHelpers.ts';
import {
  Compass,
  Calendar,
  MapPin,
  Wallet,
  Users,
  Image,
  X,
  Plus,
  Search,
  Globe2,
} from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
  prefillDestination?: Destination | null;
  currency: string;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
  prefillDestination,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [flag, setFlag] = useState('✈️');
  const [startDate, setStartDate] = useState('2025-07-10');
  const [endDate, setEndDate] = useState('2025-07-18');
  const [budget, setBudget] = useState(75000);
  const [companions, setCompanions] = useState('Solo / Friends');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
  );
  const [notes, setNotes] = useState('');

  // Places Search autocomplete state
  const [placeResults, setPlaceResults] = useState<PlaceItem[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showPlacesDropdown, setShowPlacesDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (prefillDestination) {
        setTitle(`${prefillDestination.name} Escape`);
        setDestination(prefillDestination.name);
        setCountry(prefillDestination.country);
        setFlag(prefillDestination.flag || '✈️');
        setCoverImage(prefillDestination.image);
        setBudget(prefillDestination.avgCostPerDay ? prefillDestination.avgCostPerDay * 7 : 75000);
      } else {
        setTitle('');
        setDestination('');
        setCountry('');
        setFlag('✈️');
        setCoverImage('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80');
        setBudget(75000);
      }
      setPlaceResults([]);
      setShowPlacesDropdown(false);
    }
  }, [isOpen, prefillDestination]);

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    if (!title || title.endsWith('Escape') || title.endsWith('Adventure') || title.endsWith('Journey')) {
      setTitle(`${val} Adventure`);
    }

    if (val.trim().length >= 2) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearchingPlaces(true);
        try {
          const places = await api.searchPlaces(val.trim());
          setPlaceResults(places);
          setShowPlacesDropdown(true);
        } catch {
          setPlaceResults([]);
        } finally {
          setIsSearchingPlaces(false);
        }
      }, 250);
    } else {
      setPlaceResults([]);
      setShowPlacesDropdown(false);
    }
  };

  const handleSelectPlace = (place: PlaceItem) => {
    setDestination(place.name);
    setCountry(place.country);
    setFlag(place.flag || '🌍');
    if (!title || title.endsWith('Adventure')) {
      setTitle(`${place.name} Journey`);
    }
    setShowPlacesDropdown(false);
  };

  if (!isOpen) return null;

  const sampleCovers = [
    {
      name: 'Mountains',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Beaches',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'European Heritage',
      url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Tropical Palms',
      url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) return;

    const sObj = parseDateSafe(startDate) || new Date();
    const eObj = parseDateSafe(endDate) || new Date();
    const formattedStart = formatDateReadable(sObj);
    const formattedEnd = formatDateReadable(eObj);
    const durationDays = calculateTripDurationDays(startDate, endDate);

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title: title.trim(),
      destination: destination.trim(),
      country: country.trim() || 'Global',
      flag: flag.trim() || '🌍',
      startDate: formattedStart,
      endDate: formattedEnd,
      startsInDays: Math.max(
        1,
        Math.ceil((sObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      ),
      progressPercent: 20,
      coverImage: coverImage,
      budget: Number(budget) || 50000,
      spent: 0,
      status: 'upcoming',
      companions: companions.split(',').map((c) => c.trim()),
      notes: notes.trim() || 'Initial itinerary draft created.',
      activitiesCount: 0,
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between pb-4 border-b border-[#e0e0d5] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5d6d5a] text-[#fdfcf8] flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#2d3436]">
                Plan New Journey
              </h3>
              <p className="text-xs text-[#7f8c8d]">
                Set destinations, worldwide locations, dates, and budget
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7f8c8d] hover:bg-[#f5f5f0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination Autocomplete Input */}
          <div className="relative">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1 flex items-center justify-between">
              <span>Destination City / Worldwide Landmark</span>
              <span className="text-[#5d6d5a] flex items-center gap-1">
                <Globe2 className="w-3 h-3" /> Worldwide Geocoding
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                placeholder="Type any city worldwide (e.g. Kyoto, Rome, Cairo, Sydney...)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
              />
              <MapPin className="w-4 h-4 text-[#7f8c8d] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Autocomplete Dropdown */}
            {showPlacesDropdown && placeResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-[#e0e0d5] rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto animate-in fade-in duration-150">
                <div className="p-2 text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] bg-[#f5f5f0]/80 border-b border-[#e0e0d5]">
                  Worldwide Matching Locations
                </div>
                {placeResults.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className="px-3.5 py-2.5 hover:bg-[#f5f5f0] cursor-pointer flex items-center justify-between transition-colors border-b border-[#e0e0d5]/40 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{place.flag}</span>
                      <div>
                        <div className="text-xs font-bold text-[#2d3436]">{place.name}</div>
                        <div className="text-[10px] text-[#7f8c8d]">{place.country}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#5d6d5a] bg-[#f5f5f0] px-2 py-0.5 rounded-full border border-[#e0e0d5]">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Trip Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kyoto Autumn Foliage Tour"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Country Flag
              </label>
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="🇯🇵"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Departure Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Return Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
              />
            </div>
          </div>

          {/* Live Calculated Trip Duration Display */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#5d6d5a]/10 border border-[#5d6d5a]/20 text-xs text-[#2d3436]">
            <span className="font-semibold flex items-center gap-1.5 text-[#5d6d5a]">
              <Calendar className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Calculated Journey Length:</span>
            </span>
            <span className="font-bold px-2 py-0.5 rounded-md bg-white border border-[#e0e0d5] text-[#2d3436]">
              {calculateTripDurationDays(startDate, endDate)} {calculateTripDurationDays(startDate, endDate) === 1 ? 'Day' : 'Days'} ({Math.max(0, calculateTripDurationDays(startDate, endDate) - 1)} {calculateTripDurationDays(startDate, endDate) === 2 ? 'Night' : 'Nights'})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Target Budget ({currency})
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Travel Companions
              </label>
              <input
                type="text"
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                placeholder="e.g. Partner, Solo, Family"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
              />
            </div>
          </div>

          {/* Cover Photo selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1.5">
              Cover Atmosphere Photo
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {sampleCovers.map((cov) => (
                <div
                  key={cov.name}
                  onClick={() => setCoverImage(cov.url)}
                  className={`relative h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    coverImage === cov.url
                      ? 'border-[#5d6d5a] ring-2 ring-[#5d6d5a]/20'
                      : 'border-[#e0e0d5]'
                  }`}
                >
                  <img
                    src={cov.url}
                    alt={cov.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-medium truncate">
                    {cov.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
              Trip Notes &amp; Goals
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Must try matcha soft serve in Uji and visit Fushimi Inari at sunrise."
              className="w-full px-4 py-2 rounded-xl border border-[#e0e0d5] bg-white text-xs focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e0e0d5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7f8c8d] hover:bg-[#f5f5f0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Journey</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
