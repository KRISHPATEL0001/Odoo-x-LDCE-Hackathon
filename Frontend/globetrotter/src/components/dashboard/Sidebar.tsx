import React from 'react';
import { DashboardTab } from '../../types.ts';
import {
  Compass,
  LayoutDashboard,
  PlusCircle,
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
  X,
  Bot,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenCreateTrip: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateTrip,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItemClass = (tab: DashboardTab) => {
    const isActive = currentTab === tab;
    return `w-full flex items-center ${
      isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'
    } py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 shrink-0 bg-[#fdfcf8] border-r border-[#e0e0d5] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile
            ? 'translate-x-0 shadow-2xl'
            : 'max-lg:-translate-x-full'
        }`}
      >
        {/* Top Logo and Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
          {/* Logo Header */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} mb-6`}>
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                onSelectTab('dashboard');
                onCloseMobile();
              }}
              title="GlobeTrotter"
            >
              <div className="w-9 h-9 rounded-xl bg-[#5d6d5a] text-[#fdfcf8] flex items-center justify-center shadow-md shadow-[#5d6d5a]/20 shrink-0">
                <Compass className="w-5 h-5 text-[#fdfcf8]" />
              </div>
              {!isCollapsed && (
                <span className="font-serif italic font-bold text-2xl tracking-tight text-[#2d3436] whitespace-nowrap">
                  GlobeTrotter
                </span>
              )}
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              className="p-1 rounded-lg text-[#7f8c8d] hover:bg-[#f5f5f0] lg:hidden cursor-pointer"
              onClick={onCloseMobile}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Dashboard items */}
          <div className="mb-4 space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectTab('dashboard');
                onCloseMobile();
              }}
              className={navItemClass('dashboard')}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab('ai-assistant');
                onCloseMobile();
              }}
              className={navItemClass('ai-assistant')}
              title="AI Travel Copilot"
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full`}>
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-[#d4a373] shrink-0" />
                  {!isCollapsed && <span>AI Travel Copilot</span>}
                </div>
                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#d4a373]/20 text-[#d4a373] text-[9px] font-extrabold uppercase">
                    AI
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab('map');
                onCloseMobile();
              }}
              className={navItemClass('map')}
              title="Maps & Google Maps"
            >
              <Compass className="w-4 h-4 text-[#d4a373] shrink-0" />
              {!isCollapsed && <span>Maps &amp; Google Maps</span>}
            </button>
          </div>

          {/* Section: PLAN YOUR JOURNEY */}
          <div className="mb-5">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#7f8c8d]">
                Plan Your Journey
              </div>
            )}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onOpenCreateTrip();
                  onCloseMobile();
                }}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'
                } py-2.5 rounded-xl text-sm font-medium text-[#5d6d5a] hover:bg-[#e9e9e0]/60 transition-all cursor-pointer`}
                title="Create Trip"
              >
                <PlusCircle className="w-4 h-4 text-[#d4a373] shrink-0" />
                {!isCollapsed && <span className="font-semibold">Create Trip</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('browse-destinations');
                  onCloseMobile();
                }}
                className={navItemClass('browse-destinations')}
                title="Browse Destinations"
              >
                <Compass className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Browse Destinations</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('itinerary-planner');
                  onCloseMobile();
                }}
                className={navItemClass('itinerary-planner')}
                title="Itinerary Planner"
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Itinerary Planner</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('budget-planner');
                  onCloseMobile();
                }}
                className={navItemClass('budget-planner')}
                title="Budget Planner"
              >
                <Wallet className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Budget Planner</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('activity-suggestions');
                  onCloseMobile();
                }}
                className={navItemClass('activity-suggestions')}
                title="Activity Suggestions"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Activity Suggestions</span>}
              </button>
            </div>
          </div>

          {/* Section: TRIPS */}
          <div className="mb-5">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#7f8c8d]">
                Trips
              </div>
            )}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('upcoming-trips');
                  onCloseMobile();
                }}
                className={navItemClass('upcoming-trips')}
                title="Upcoming Trips"
              >
                <PlaneTakeoff className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Upcoming Trips</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('saved-trips');
                  onCloseMobile();
                }}
                className={navItemClass('saved-trips')}
                title="Saved Wishlist"
              >
                <Bookmark className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Saved Wishlist</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('trip-history');
                  onCloseMobile();
                }}
                className={navItemClass('trip-history')}
                title="Trip History"
              >
                <History className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Trip History</span>}
              </button>
            </div>
          </div>

          {/* Section: ACCOUNT */}
          <div className="mb-2">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-[#7f8c8d]">
                Account
              </div>
            )}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('profile');
                  onCloseMobile();
                }}
                className={navItemClass('profile')}
                title="Profile"
              >
                <User className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Profile</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('settings');
                  onCloseMobile();
                }}
                className={navItemClass('settings')}
                title="Settings"
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('help');
                  onCloseMobile();
                }}
                className={navItemClass('help')}
                title="Help & FAQ"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Help &amp; FAQ</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions: Collapse button & Logout */}
        <div className="p-3 border-t border-[#e0e0d5] space-y-1.5 bg-[#fdfcf8]">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-full hidden lg:flex items-center justify-center p-2 rounded-xl text-xs font-semibold text-[#7f8c8d] hover:text-[#2d3436] hover:bg-[#f5f5f0] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[11px]">Collapse Menu</span>
                </div>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'
            } py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
