import React, { useState } from 'react';
import { Destination } from '../../types.ts';
import {
  Search,
  Star,
  MapPin,
  Calendar,
  Wallet,
  Bookmark,
  BookmarkCheck,
  Compass,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface BrowseDestinationsViewProps {
  destinations: Destination[];
  onToggleSave: (id: string) => void;
  onPlanForDestination: (destination: Destination) => void;
  initialSearch?: string;
  currency: string;
}

export const BrowseDestinationsView: React.FC<BrowseDestinationsViewProps> = ({
  destinations,
  onToggleSave,
  onPlanForDestination,
  initialSearch = '',
  currency,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'mountain', label: 'Mountain & Alpine' },
    { id: 'beach', label: 'Beach & Coastal' },
    { id: 'cultural', label: 'Heritage & Culture' },
    { id: 'city', label: 'City & Modern' },
  ];

  const filtered = destinations.filter((dest) => {
    const matchesCategory =
      selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesSearch =
      dest.name.toLowerCase().includes(search.toLowerCase()) ||
      dest.country.toLowerCase().includes(search.toLowerCase()) ||
      dest.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#d4a373]" />
            Global Destination Catalog
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
            Browse Handpicked Destinations
          </h2>
          <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1 max-w-xl">
            Explore curated escapes worldwide with estimated daily costs, optimal travel seasons, and authentic traveler reviews.
          </p>
        </div>

        {/* Search inside catalog */}
        <div className="w-full md:w-72 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7f8c8d]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter destination..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-[#7f8c8d] shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-sm font-semibold'
                : 'bg-[#f5f5f0] text-[#333533] hover:bg-[#e9e9e0] border border-[#e0e0d5]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Destination Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((dest) => (
          <div
            key={dest.id}
            className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#5d6d5a]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image & Save bookmark */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                {/* Rating Badge */}
                <div className="absolute top-3 left-3 bg-[#fdfcf8]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#2d3436] flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
                  <span>{dest.rating}</span>
                  <span className="text-[10px] text-[#7f8c8d] font-normal">
                    ({dest.reviewsCount})
                  </span>
                </div>

                {/* Bookmark save toggle */}
                <button
                  type="button"
                  onClick={() => onToggleSave(dest.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer"
                  title={dest.isSaved ? 'Saved to wishlist' : 'Save to wishlist'}
                >
                  {dest.isSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-[#d4a373]" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif font-bold text-xl text-[#2d3436] flex items-center gap-1.5">
                    <span>{dest.name}</span>
                    <span>{dest.flag}</span>
                  </h3>
                  <span className="text-xs text-[#7f8c8d] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#5d6d5a]" />
                    {dest.country}
                  </span>
                </div>

                <p className="text-xs text-[#7f8c8d] line-clamp-2 leading-relaxed mb-4">
                  {dest.description}
                </p>

                {/* Highlights tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dest.highlights.slice(0, 3).map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#f5f5f0] text-[11px] text-[#333533] border border-[#e0e0d5]"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Meta details: Season & Cost */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#e0e0d5]/60 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7f8c8d]">
                      Best Season
                    </div>
                    <div className="font-semibold text-[#2d3436] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#5d6d5a]" />
                      <span className="truncate">{dest.bestMonths}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#7f8c8d]">
                      Est. Daily Cost
                    </div>
                    <div className="font-semibold text-[#2d3436] flex items-center gap-1 mt-0.5">
                      <Wallet className="w-3 h-3 text-[#d4a373]" />
                      <span>{currency}{dest.avgCostPerDay.toLocaleString()} / day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="px-5 pb-5 pt-1">
              <button
                type="button"
                onClick={() => onPlanForDestination(dest)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Plan Trip to {dest.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
