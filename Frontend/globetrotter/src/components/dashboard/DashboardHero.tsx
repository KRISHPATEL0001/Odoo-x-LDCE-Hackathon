import React, { useState, useRef, useEffect } from 'react';
import { Search, Plane, Sparkles, MapPin, Globe2 } from 'lucide-react';
import { api, PlaceItem } from '../../services/api.ts';

interface DashboardHeroProps {
  userName: string;
  onSearch: (query: string) => void;
  onSelectPopular: (tag: string) => void;
  onSelectPlace?: (place: PlaceItem) => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  userName,
  onSearch,
  onSelectPopular,
  onSelectPlace,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceItem[]>([]);
  const [showPlacesDropdown, setShowPlacesDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const popularTags = ['Bali', 'Swiss Alps', 'Paris', 'Manali', 'Dubai', 'Tokyo', 'Rome', 'Sydney'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPlacesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim().length >= 2) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await api.searchPlaces(val.trim());
          setPlaceResults(results);
          setShowPlacesDropdown(true);
        } catch {
          setPlaceResults([]);
        }
      }, 200);
    } else {
      setPlaceResults([]);
      setShowPlacesDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setShowPlacesDropdown(false);
    }
  };

  return (
    <div
      id="dashboard-hero-banner"
      className="relative rounded-3xl shadow-lg border border-[#e0e0d5] mb-8 text-[#fdfcf8] min-h-[320px] sm:min-h-[360px] flex flex-col justify-between p-6 sm:p-10"
    >
      {/* Background Image: Mountain & Lake Vista */}
      <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
          alt="Scenic Mountain Lake"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Soft atmospheric Natural Tone Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d3436]/90 via-[#2d3436]/75 to-[#2d3436]/50" />
        <div className="absolute inset-0 bg-[#5d6d5a]/25 mix-blend-multiply" />
      </div>

      {/* Top and Center Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
        <div className="max-w-2xl w-full">
          <div className="text-sm sm:text-base font-light tracking-wide opacity-90 mb-1 text-[#fdfcf8]">
            Welcome back,
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#fdfcf8] flex items-center gap-3">
            <span>{userName || 'Krish Patel'}!</span>
            <Plane className="w-7 h-7 sm:w-8 sm:h-8 text-[#d4a373] -rotate-45 inline-block shrink-0 animate-pulse" />
          </h1>
          <p className="text-sm sm:text-base opacity-85 mt-2 font-normal text-[#fdfcf8]">
            Where will your next adventure take you?
          </p>

          {/* Search Bar with live geocoding dropdown */}
          <div ref={containerRef} className="relative mt-6 max-w-xl">
            <form onSubmit={handleSubmit} className="flex items-center">
              <div className="relative flex-1">
                <input
                  id="hero-destination-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (placeResults.length > 0) setShowPlacesDropdown(true);
                  }}
                  placeholder="Search destinations, landmarks, or cities worldwide..."
                  className="w-full py-3.5 pl-4 pr-12 rounded-l-2xl sm:rounded-l-2xl bg-[#fdfcf8]/95 text-[#2d3436] text-sm focus:outline-none placeholder:text-[#8f9b8c] shadow-md border-y border-l border-white/40"
                />
              </div>
              <button
                id="btn-hero-search-submit"
                type="submit"
                className="bg-[#2d3436] hover:bg-[#1e2324] text-white px-5 py-3.5 rounded-r-2xl border-y border-r border-[#2d3436] transition-colors flex items-center justify-center cursor-pointer shadow-md"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-[#d4a373]" />
              </button>
            </form>

            {/* Places Autocomplete Dropdown */}
            {showPlacesDropdown && placeResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e0e0d5] rounded-2xl shadow-2xl overflow-hidden z-40 animate-in fade-in duration-150 max-h-60 overflow-y-auto">
                <div className="px-3.5 py-2 text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] bg-[#f5f5f0] border-b border-[#e0e0d5] flex items-center justify-between">
                  <span>Worldwide Matching Places</span>
                  <span className="text-[#5d6d5a] flex items-center gap-1">
                    <Globe2 className="w-3 h-3" /> Geocoding API
                  </span>
                </div>
                {placeResults.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => {
                      setSearchTerm(place.name);
                      if (onSelectPlace) {
                        onSelectPlace(place);
                      } else {
                        onSearch(place.name);
                      }
                      setShowPlacesDropdown(false);
                    }}
                    className="px-4 py-2.5 hover:bg-[#f5f5f0] flex items-center justify-between transition-colors border-b border-[#e0e0d5]/40 last:border-0 cursor-pointer text-[#2d3436]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{place.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#2d3436] flex items-center gap-1.5 truncate">
                          <span>{place.name}</span>
                          {place.isAutoPredicted && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-900 rounded-md border border-amber-300 shrink-0">
                              ✨ Auto-Predicted
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#7f8c8d] truncate">{place.displayName || place.country}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#5d6d5a] bg-[#f5f5f0] px-2 py-0.5 rounded-full border border-[#e0e0d5] shrink-0 ml-2">
                      Explore
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Searches Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="opacity-80 font-medium">Popular Searches:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchTerm(tag);
                  onSelectPopular(tag);
                }}
                className="px-3 py-1 rounded-full bg-[#fdfcf8]/20 hover:bg-[#fdfcf8]/35 text-[#fdfcf8] backdrop-blur-xs transition-all border border-white/20 text-xs font-medium cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Block on the right side */}
        <div className="relative z-10 max-w-xs text-right hidden lg:block bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <p className="text-xs sm:text-sm italic font-serif opacity-95 leading-relaxed text-[#fdfcf8]">
            "The journey of a thousand miles begins with a single step."
          </p>
          <p className="text-xs text-[#d4a373] mt-2 font-semibold tracking-wider">
            — Lao Tzu
          </p>
        </div>
      </div>
    </div>
  );
};
