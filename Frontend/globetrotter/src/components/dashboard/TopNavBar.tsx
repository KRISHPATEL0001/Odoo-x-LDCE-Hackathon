import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types.ts';
import {
  Menu,
  Bell,
  MessageSquare,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  Plane,
  CheckCircle,
} from 'lucide-react';

interface TopNavBarProps {
  user: UserProfile | null;
  onToggleSidebar: () => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  user,
  onToggleSidebar,
  onSearch,
  onLogout,
  onOpenProfile,
  onOpenSettings,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const displayName = user?.name || 'Krish Patel';
  const displayAvatar =
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';

  return (
    <header className="h-16 border-b border-[#e0e0d5] bg-[#fdfcf8]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Sidebar toggle & Quick search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          id="btn-sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#333533] hover:bg-[#f5f5f0] border border-transparent hover:border-[#e0e0d5] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7f8c8d]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="nav-search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search trips, places, or activities..."
            className="w-full pl-10 pr-4 py-2 bg-[#f5f5f0] text-sm text-[#2d3436] rounded-xl border border-transparent focus:border-[#5d6d5a] focus:bg-[#fdfcf8] focus:outline-none transition-all placeholder:text-[#a0a090]"
          />
        </form>
      </div>

      {/* Right section: Notification bell, messages, user avatar badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#333533] hover:bg-[#f5f5f0] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#5d6d5a]" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#fdfcf8]">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0e0d5] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2d3436]">
                  Traveler Alerts
                </span>
                <span className="text-[11px] text-[#5d6d5a] font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#f5f5f0] flex items-start gap-2.5">
                  <Plane className="w-4 h-4 text-[#5d6d5a] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#2d3436]">
                      Swiss Alps Trip starts in 5 days!
                    </p>
                    <p className="text-[#7f8c8d] text-[11px] mt-0.5">
                      Don't forget to pack alpine layers and thermal gear.
                    </p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f5f5f0] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#d4a373] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#2d3436]">
                      Activity Confirmed: Brienz Cruise
                    </p>
                    <p className="text-[#7f8c8d] text-[11px] mt-0.5">
                      Voucher ready in your Itinerary Planner.
                    </p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f5f5f0] flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#2d3436]">
                      Budget Sync Completed
                    </p>
                    <p className="text-[#7f8c8d] text-[11px] mt-0.5">
                      All travel receipts stored securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages Dropdown */}
        <div className="relative" ref={msgRef}>
          <button
            id="btn-messages"
            type="button"
            onClick={() => setShowMessages(!showMessages)}
            className="relative p-2 rounded-xl text-[#333533] hover:bg-[#f5f5f0] transition-colors"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5 text-[#5d6d5a]" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d4a373] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#fdfcf8]">
              2
            </span>
          </button>

          {showMessages && (
            <div className="absolute right-0 mt-2 w-72 bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0e0d5] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2d3436]">
                  Travel Companions
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl hover:bg-[#f5f5f0] cursor-pointer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#5d6d5a] text-white flex items-center justify-center font-bold text-xs">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-[#2d3436]">Sarah (Swiss Alps)</p>
                    <p className="text-[#7f8c8d] text-[11px] truncate">
                      "I booked the fondue dinner at 8 PM!"
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl hover:bg-[#f5f5f0] cursor-pointer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#d4a373] text-white flex items-center justify-center font-bold text-xs">
                    L
                  </div>
                  <div>
                    <p className="font-semibold text-[#2d3436]">Liam (Co-traveler)</p>
                    <p className="text-[#7f8c8d] text-[11px] truncate">
                      "Train pass confirmed for Interlaken."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative pl-1" ref={userMenuRef}>
          <button
            id="btn-user-dropdown"
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#f5f5f0] border border-transparent hover:border-[#e0e0d5] transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#d4a373] shadow-xs bg-[#f5f5f0]">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-[#2d3436] leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-[#7f8c8d] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Explorer
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7f8c8d] hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-[#e0e0d5] mb-1">
                <p className="text-xs font-bold text-[#2d3436]">{displayName}</p>
                <p className="text-[11px] text-[#7f8c8d] truncate">
                  {user?.email || 'explorer@globetrotter.io'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenProfile();
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-[#333533] hover:bg-[#f5f5f0] flex items-center gap-2.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#5d6d5a]" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenSettings();
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-[#333533] hover:bg-[#f5f5f0] flex items-center gap-2.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[#5d6d5a]" />
                <span>Account Settings</span>
              </button>

              <div className="border-t border-[#e0e0d5] my-1" />

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
