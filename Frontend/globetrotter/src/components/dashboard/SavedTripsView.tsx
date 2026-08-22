import React from 'react';
import { Destination } from '../../types.ts';
import { Bookmark, Star, MapPin, ArrowRight, Trash2 } from 'lucide-react';

interface SavedTripsViewProps {
  savedDestinations: Destination[];
  onRemoveSaved: (id: string) => void;
  onPlanTrip: (destination: Destination) => void;
  currency: string;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  savedDestinations,
  onRemoveSaved,
  onPlanTrip,
  currency,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
          <Bookmark className="w-3.5 h-3.5 text-[#d4a373]" />
          Travel Bucket List
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
          Saved Destinations &amp; Wishlist ({savedDestinations.length})
        </h2>
        <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1 max-w-xl">
          Places you've bookmarked for future escapes. Convert any saved spot into an active itinerary with one click.
        </p>
      </div>

      {savedDestinations.length === 0 ? (
        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-12 text-center text-[#7f8c8d]">
          <Bookmark className="w-10 h-10 mx-auto text-[#d4a373] mb-3" />
          <p className="font-semibold text-base text-[#2d3436]">
            Your wishlist is currently empty
          </p>
          <p className="text-xs mt-1">
            Browse destinations to bookmark your dream travel spots.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDestinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl overflow-hidden shadow-sm hover:border-[#5d6d5a]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveSaved(dest.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute top-3 left-3 bg-[#fdfcf8]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#2d3436] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
                    <span>{dest.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif font-bold text-lg text-[#2d3436] flex items-center gap-1.5">
                      <span>{dest.name}</span>
                      <span>{dest.flag}</span>
                    </h3>
                    <span className="text-xs text-[#7f8c8d]">{dest.country}</span>
                  </div>

                  <p className="text-xs text-[#7f8c8d] line-clamp-2 leading-relaxed mb-3">
                    {dest.description}
                  </p>

                  <div className="text-xs text-[#5d6d5a] font-medium mb-1">
                    Est. {currency}
                    {dest.avgCostPerDay.toLocaleString()} / day
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => onPlanTrip(dest)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Start Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
