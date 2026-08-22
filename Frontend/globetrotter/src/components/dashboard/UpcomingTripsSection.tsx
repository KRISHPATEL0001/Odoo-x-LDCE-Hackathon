import React from 'react';
import { Trip } from '../../types.ts';
import {
  Calendar,
  MapPin,
  MoreHorizontal,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface UpcomingTripsSectionProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onViewAll: () => void;
  onAddNewTrip: () => void;
}

export const UpcomingTripsSection: React.FC<UpcomingTripsSectionProps> = ({
  trips,
  onSelectTrip,
  onViewAll,
  onAddNewTrip,
}) => {
  const upcomingOnly = trips.filter((t) => t.status === 'upcoming').slice(0, 3);

  return (
    <div id="upcoming-trips-section" className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2d3436]">
          Your Upcoming Trips
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-[#5d6d5a] hover:text-[#4a5748] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Trip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingOnly.map((trip) => (
          <div
            key={trip.id}
            onClick={() => onSelectTrip(trip)}
            className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#5d6d5a]/60 transition-all cursor-pointer group flex flex-col"
          >
            {/* Image & Badges */}
            <div className="relative h-44 sm:h-48 overflow-hidden">
              <img
                src={trip.coverImage}
                alt={trip.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Starts in badge */}
              <div className="absolute top-3 left-3 bg-[#fdfcf8]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#2d3436] shadow-xs">
                Starts in {trip.startsInDays} days
              </div>

              {/* Action Menu button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTrip(trip);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Trip Details */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2d3436] flex items-center gap-1.5 mb-1.5">
                  <span>{trip.title}</span>
                  <span>{trip.flag}</span>
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#7f8c8d] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5d6d5a]" />
                  <span>
                    {trip.startDate} – {trip.endDate}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#7f8c8d] mb-4">
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>{trip.destination}, {trip.country}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-2 border-t border-[#e0e0d5]/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#2d3436]">
                    {trip.progressPercent}% Planned
                  </span>
                  <span className="text-[#7f8c8d] text-[11px]">
                    {trip.activitiesCount || 6} activities
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f5f5f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5d6d5a] rounded-full transition-all duration-500"
                    style={{ width: `${trip.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Quick Trip Card if fewer than 3 */}
        {upcomingOnly.length < 3 && (
          <div
            onClick={onAddNewTrip}
            className="border-2 border-dashed border-[#d4a373]/60 hover:border-[#5d6d5a] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#f5f5f0]/30 hover:bg-[#f5f5f0] transition-all cursor-pointer min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-full bg-[#5d6d5a]/10 text-[#5d6d5a] flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-[#5d6d5a]" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#2d3436]">
              Plan a New Journey
            </h4>
            <p className="text-xs text-[#7f8c8d] mt-1 max-w-xs">
              Choose your dates, invite friends, and map out your next dream destination.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
