import React from 'react';
import { DashboardTab } from '../../types.ts';
import {
  Compass,
  LayoutDashboard,
  PlusCircle,
  Compass as CompassIcon,
  CalendarCheck,
  Wallet,
  Sparkles,
  History,
  PlaneTakeoff,
  Bookmark,
  User,
  Settings,
  HelpCircle,
  LogOut,
  CloudSun,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenCreateTrip: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateTrip,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItemClass = (tab: DashboardTab) => {
    const isActive = currentTab === tab;
    return `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
      isActive
        ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-sm font-semibold'
        : 'text-[#333533]/80 hover:text-[#2d3436] hover:bg-[#f5f5f0]'
    }`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-[#fdfcf8] border-r border-[#e0e0d5] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo and Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
          {/* Logo Header */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                onSelectTab('dashboard');
                onCloseMobile();
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-[#5d6d5a] text-[#fdfcf8] flex items-center justify-center shadow-md shadow-[#5d6d5a]/20">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-serif italic font-bold text-2xl tracking-tight text-[#2d3436]">
                GlobeTrotter
              </span>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              className="p-1 rounded-lg text-[#7f8c8d] hover:bg-[#f5f5f0] lg:hidden"
              onClick={onCloseMobile}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Dashboard item */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                onSelectTab('dashboard');
                onCloseMobile();
              }}
              className={navItemClass('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Section: PLAN YOUR JOURNEY */}
          <div className="mb-5">
            <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#7f8c8d]">
              Plan Your Journey
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onOpenCreateTrip();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#5d6d5a] hover:bg-[#e9e9e0]/60 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#d4a373]" />
                <span className="font-semibold">Create Trip</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('browse-destinations');
                  onCloseMobile();
                }}
                className={navItemClass('browse-destinations')}
              >
                <CompassIcon className="w-4 h-4" />
                <span>Browse Destinations</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('itinerary-planner');
                  onCloseMobile();
                }}
                className={navItemClass('itinerary-planner')}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Itinerary Planner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('budget-planner');
                  onCloseMobile();
                }}
                className={navItemClass('budget-planner')}
              >
                <Wallet className="w-4 h-4" />
                <span>Budget Planner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('activity-suggestions');
                  onCloseMobile();
                }}
                className={navItemClass('activity-suggestions')}
              >
                <Sparkles className="w-4 h-4" />
                <span>Activity Suggestions</span>
              </button>
            </div>
          </div>

          {/* Section: MY TRIPS */}
          <div className="mb-5">
            <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#7f8c8d]">
              My Trips
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('trip-history');
                  onCloseMobile();
                }}
                className={navItemClass('trip-history')}
              >
                <History className="w-4 h-4" />
                <span>Trip History</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('upcoming-trips');
                  onCloseMobile();
                }}
                className={navItemClass('upcoming-trips')}
              >
                <PlaneTakeoff className="w-4 h-4" />
                <span>Upcoming Trips</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('saved-trips');
                  onCloseMobile();
                }}
                className={navItemClass('saved-trips')}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved Trips</span>
              </button>
            </div>
          </div>

          {/* Section: ACCOUNT */}
          <div className="mb-4">
            <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#7f8c8d]">
              Account
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('profile');
                  onCloseMobile();
                }}
                className={navItemClass('profile')}
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('settings');
                  onCloseMobile();
                }}
                className={navItemClass('settings')}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('help');
                  onCloseMobile();
                }}
                className={navItemClass('help')}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help &amp; Support</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Feature Widget: Traveler Tips & Weather */}
        <div className="p-4 border-t border-[#e0e0d5] bg-[#f5f5f0]/60">
          <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e0e0d5] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5d6d5a]/10 text-[#5d6d5a] flex items-center justify-center shrink-0">
              <CloudSun className="w-5 h-5 text-[#d4a373]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#2d3436] truncate">
                Interlaken Weather
              </div>
              <div className="text-[11px] text-[#7f8c8d] flex items-center justify-between">
                <span>18°C Mild Sunny</span>
                <span className="font-semibold text-[#5d6d5a]">Pack light</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
