import React from 'react';
import { Trip } from '../../types.ts';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Wallet,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface TripHistoryViewProps {
  trips: Trip[];
  currency: string;
  onPlanAgain: (trip: Trip) => void;
}

export const TripHistoryView: React.FC<TripHistoryViewProps> = ({
  trips,
  currency,
  onPlanAgain,
}) => {
  const completed = trips.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#5d6d5a]" />
          Completed Journeys &amp; Memories
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
          Trip History &amp; Travel Journal
        </h2>
        <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1 max-w-xl">
          Review past itineraries, memories recorded on the road, and total financial logs from completed trips.
        </p>
      </div>

      <div className="space-y-4">
        {completed.map((trip) => (
          <div
            key={trip.id}
            className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-[#5d6d5a]/60 transition-all shadow-xs"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-[#e0e0d5]">
                <img
                  src={trip.coverImage}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </div>

                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2d3436] flex items-center gap-1.5">
                  <span>{trip.title}</span>
                  <span>{trip.flag}</span>
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7f8c8d] mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#5d6d5a]" />
                    {trip.startDate} – {trip.endDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                    {trip.destination}
                  </span>
                </div>

                {trip.notes && (
                  <p className="text-xs text-[#7f8c8d] italic mt-2 max-w-lg">
                    "{trip.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#e0e0d5]/60">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#7f8c8d]">
                  Total Spent
                </span>
                <div className="text-base sm:text-lg font-serif font-bold text-[#2d3436]">
                  {currency}
                  {trip.spent.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onPlanAgain(trip)}
                className="px-4 py-2 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Plan Again</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
