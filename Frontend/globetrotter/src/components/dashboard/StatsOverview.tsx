import React from 'react';
import { Luggage, Calendar, MapPin, Wallet, ArrowRight } from 'lucide-react';
import { DashboardTab } from '../../types.ts';

interface StatsOverviewProps {
  upcomingCount: number;
  completedCount: number;
  destinationsCount: number;
  totalSpent: number;
  currency: string;
  nextDestination?: string;
  onNavigate: (tab: DashboardTab) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  upcomingCount,
  completedCount,
  destinationsCount,
  totalSpent,
  currency,
  nextDestination,
  onNavigate,
}) => {
  const formatCurrency = (val: number) => {
    return `${currency}${(val || 0).toLocaleString()}`;
  };

  return (
    <div
      id="dashboard-stats-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* 1. Upcoming Trips */}
      <div
        onClick={() => onNavigate('upcoming-trips')}
        className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-4.5 hover:shadow-md hover:border-[#5d6d5a]/50 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Luggage className="w-5 h-5" />
          </div>
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-[#f5f5f0] text-[#7f8c8d] group-hover:bg-[#5d6d5a] group-hover:text-white flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2d3436]">
            {upcomingCount}
          </div>
          <div className="text-xs font-semibold text-[#2d3436] mt-0.5">
            Upcoming Trips
          </div>
          <div className="text-[11px] text-[#7f8c8d] mt-1 flex items-center gap-1">
            {nextDestination ? (
              <span>Next: {nextDestination}</span>
            ) : (
              <span>No upcoming journeys</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Trips Completed */}
      <div
        onClick={() => onNavigate('trip-history')}
        className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-4.5 hover:shadow-md hover:border-[#5d6d5a]/50 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Calendar className="w-5 h-5" />
          </div>
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-[#f5f5f0] text-[#7f8c8d] group-hover:bg-[#5d6d5a] group-hover:text-white flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2d3436]">
            {completedCount}
          </div>
          <div className="text-xs font-semibold text-[#2d3436] mt-0.5">
            Trips Completed
          </div>
          <div className="text-[11px] text-[#7f8c8d] mt-1">
            {completedCount > 0 ? 'Travel journal active' : '0 completed so far'}
          </div>
        </div>
      </div>

      {/* 3. Destinations Explored */}
      <div
        onClick={() => onNavigate('browse-destinations')}
        className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-4.5 hover:shadow-md hover:border-[#5d6d5a]/50 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <MapPin className="w-5 h-5" />
          </div>
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-[#f5f5f0] text-[#7f8c8d] group-hover:bg-[#5d6d5a] group-hover:text-white flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2d3436]">
            {destinationsCount}
          </div>
          <div className="text-xs font-semibold text-[#2d3436] mt-0.5">
            Destinations Explored
          </div>
          <div className="text-[11px] text-[#7f8c8d] mt-1">
            {destinationsCount > 0 ? 'Across your journeys' : 'Start your first trip'}
          </div>
        </div>
      </div>

      {/* 4. Total Spent */}
      <div
        onClick={() => onNavigate('budget-planner')}
        className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-4.5 hover:shadow-md hover:border-[#5d6d5a]/50 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <Wallet className="w-5 h-5" />
          </div>
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-[#f5f5f0] text-[#7f8c8d] group-hover:bg-[#5d6d5a] group-hover:text-white flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2d3436]">
            {formatCurrency(totalSpent)}
          </div>
          <div className="text-xs font-semibold text-[#2d3436] mt-0.5">
            Total Spent
          </div>
          <div className="text-[11px] text-[#7f8c8d] mt-1">
            {totalSpent > 0 ? 'Recorded travel expenses' : 'No expenses recorded'}
          </div>
        </div>
      </div>
    </div>
  );
};
