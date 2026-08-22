import React, { useState, useEffect } from 'react';
import { Destination, Trip } from '../../types.ts';
import { api, WeatherData } from '../../services/api.ts';
import {
  MapPin,
  Compass,
  Star,
  ExternalLink,
  Search,
  Sparkles,
  Plane,
  X,
  ArrowRight,
  ShieldCheck,
  Building,
  Utensils,
} from 'lucide-react';

interface InteractiveMapViewProps {
  destinations: Destination[];
  trips: Trip[];
  currency: string;
  onPlanTrip: (destination: Destination) => void;
  onSelectTrip: (trip: Trip) => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  destinations,
  trips,
  currency,
  onPlanTrip,
  onSelectTrip,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(
    destinations[0] || null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherInfo, setWeatherInfo] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Filter destinations
  const filtered = destinations.filter((d) => {
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Load weather when selected destination changes
  useEffect(() => {
    async function loadWeather() {
      if (selectedDestination) {
        setIsLoadingWeather(true);
        try {
          const w = await api.getWeather(
            selectedDestination.name,
            selectedDestination.lat,
            selectedDestination.lon
          );
          setWeatherInfo(w);
        } catch {
          setWeatherInfo(null);
        } finally {
          setIsLoadingWeather(false);
        }
      }
    }
    loadWeather();
  }, [selectedDestination]);

  // Static Map Preview URL (English-only Google Maps embed)
  const getMapEmbedUrl = (dest: Destination | null) => {
    const lat = dest?.lat || 21.5273;
    const lon = dest?.lon || 70.5312;
    return `https://maps.google.com/maps?q=${lat},${lon}&hl=en&z=11&output=embed`;
  };

  const getGoogleMapsUrl = (dest: Destination | null) => {
    if (!dest) return 'https://www.google.com/maps';
    if (dest.lat && dest.lon) {
      return `https://www.google.com/maps/search/?api=1&query=${dest.lat},${dest.lon}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      dest.name + ', ' + dest.country
    )}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Global Search */}
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#d4a373]" />
            Destination Maps &amp; Navigation
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
            World Destination Maps
          </h2>
          <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1 max-w-xl">
            Preview global destinations on static map cards and open directions directly in Google Maps.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7f8c8d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search worldwide locations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-xs font-medium text-[#2d3436] focus:outline-none focus:border-[#5d6d5a] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-[#2d3436]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Global Spots' },
            { id: 'mountain', label: '🏔️ Alpine & Mountains' },
            { id: 'beach', label: '🏖️ Coastal Escapes' },
            { id: 'cultural', label: '🏛️ Heritage & Culture' },
            { id: 'city', label: '🏙️ Modern Cities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-xs'
                  : 'bg-[#fdfcf8] text-[#333533] hover:bg-[#e9e9e0] border border-[#e0e0d5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="flex items-center gap-1 bg-[#f5f5f0] px-3 py-1.5 rounded-xl border border-[#e0e0d5] text-xs font-medium text-[#7f8c8d]">
          <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
          {filtered.length} locations available
        </span>
      </div>

      {/* Main Map Preview & Detail Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Non-interactive Clean Preview Map Card */}
        <div className="lg:col-span-7 bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-5 border-b border-[#e0e0d5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedDestination?.flag || '🌍'}</span>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2d3436]">
                  {selectedDestination?.name}, {selectedDestination?.country}
                </h3>
                <span className="text-[10px] text-[#7f8c8d]">
                  Static Preview Map • Coordinates: {selectedDestination?.lat?.toFixed(2) || '0.00'}°, {selectedDestination?.lon?.toFixed(2) || '0.00'}°
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-[#5d6d5a]/10 text-[#5d6d5a] text-[10px] font-bold uppercase">
              Preview Mode
            </span>
          </div>

          {/* Map Preview (Non-interactive iframe with pointer-events-none) */}
          <div className="relative w-full h-[340px] bg-[#eaeae0] overflow-hidden">
            <iframe
              title="Static Destination Map Preview"
              src={getMapEmbedUrl(selectedDestination)}
              className="w-full h-full border-0 pointer-events-none select-none"
              loading="lazy"
              tabIndex={-1}
            />
            {/* Subtle overlay badge indicating it's a preview */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm">
              <MapPin className="w-3 h-3 text-[#d4a373]" />
              <span>Map Preview</span>
            </div>
          </div>

          {/* Prominent "Open in Google Maps" Button Below Map */}
          <div className="p-4 sm:p-5 bg-[#f5f5f0] border-t border-[#e0e0d5] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#7f8c8d] text-center sm:text-left">
              View satellite imagery, real-time traffic, and turn-by-turn directions in Google Maps.
            </div>

            <a
              href={getGoogleMapsUrl(selectedDestination)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>

          {/* Quick Location Switcher Pills */}
          <div className="p-4 border-t border-[#e0e0d5] flex gap-2 overflow-x-auto pb-2 scrollbar-thin bg-white">
            {filtered.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  selectedDestination?.id === dest.id
                    ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-xs'
                    : 'bg-[#f5f5f0] text-[#2d3436] hover:bg-[#eaeae0] border border-[#e0e0d5]'
                }`}
              >
                <span>{dest.flag}</span>
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Location Detail Card */}
        <div className="lg:col-span-5 space-y-4">
          {selectedDestination ? (
            <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
              {/* Cover */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 bg-[#fdfcf8]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#2d3436] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
                  <span>{selectedDestination.rating}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif font-bold text-xl flex items-center gap-1.5">
                    <span>{selectedDestination.name}</span>
                    <span>{selectedDestination.flag}</span>
                  </h3>
                  <p className="text-xs text-white/90">{selectedDestination.country}</p>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-[#7f8c8d] leading-relaxed">
                  {selectedDestination.description}
                </p>

                {/* Highlights */}
                {selectedDestination.highlights && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d] block mb-1.5">
                      Highlights
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDestination.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#f5f5f0] border border-[#e0e0d5] text-[11px] font-medium text-[#2d3436]"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Weather Preview */}
                <div className="p-3.5 rounded-2xl bg-[#f5f5f0] border border-[#e0e0d5] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#5d6d5a]/10 text-[#5d6d5a] flex items-center justify-center text-base">
                      {weatherInfo ? weatherInfo.emoji : '🌤️'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2d3436]">
                        {weatherInfo ? `${weatherInfo.temperature}°C` : '22°C'} • {weatherInfo?.condition || 'Pleasant'}
                      </div>
                      <div className="text-[10px] text-[#7f8c8d]">Destination Weather</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#5d6d5a] bg-white px-2 py-0.5 rounded-full border border-[#e0e0d5]">
                    {selectedDestination.bestMonths}
                  </span>
                </div>

                {/* Plan Trip CTA */}
                <div className="pt-3 border-t border-[#e0e0d5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-[#7f8c8d]">Est. Daily Cost</span>
                    <div className="text-sm font-bold text-[#2d3436]">
                      {currency}{selectedDestination.avgCostPerDay.toLocaleString()} / day
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPlanTrip(selectedDestination)}
                    className="px-5 py-2.5 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-8 text-center text-[#7f8c8d]">
              <Compass className="w-8 h-8 text-[#d4a373] mx-auto mb-2" />
              <p className="text-xs">Select any location to preview details and map.</p>
            </div>
          )}

          {/* Scheduled Trips */}
          {trips.length > 0 && (
            <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7f8c8d] mb-3 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-[#5d6d5a] -rotate-45" />
                Your Active Trips ({trips.length})
              </h4>
              <div className="space-y-2">
                {trips.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTrip(t)}
                    className="p-2.5 rounded-2xl bg-[#f5f5f0] hover:bg-[#eaeae0] border border-[#e0e0d5] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{t.flag}</span>
                      <div>
                        <div className="text-xs font-bold text-[#2d3436]">{t.title}</div>
                        <div className="text-[10px] text-[#7f8c8d]">{t.destination}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#5d6d5a] bg-white px-2 py-0.5 rounded-full border border-[#e0e0d5]">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
