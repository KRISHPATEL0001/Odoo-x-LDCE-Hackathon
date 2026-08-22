import React from 'react';
import { UserProfile } from '../types.ts';
import {
  Compass,
  Mail,
  Calendar,
  CheckCircle2,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Luggage,
} from 'lucide-react';

interface ExplorerCardProps {
  user: UserProfile;
  onEditOrSignOut: () => void;
}

export const ExplorerCard: React.FC<ExplorerCardProps> = ({
  user,
  onEditOrSignOut,
}) => {
  return (
    <div
      id="explorer-profile-card"
      className="w-full max-w-lg mx-auto bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-8 sm:p-10 shadow-xl shadow-stone-300/20 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Top Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f5f5f0] border border-[#e0e0d5] text-[#5d6d5a] text-xs font-semibold mb-6">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#5d6d5a]" />
        <span>Explorer Passport Activated</span>
      </div>

      {/* User Photo / Avatar */}
      <div className="relative mb-5">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[#d4a373] shadow-md overflow-hidden bg-[#f5f5f0] flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#5d6d5a] flex items-center justify-center text-[#fdfcf8] text-3xl font-serif">
              {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 bg-[#d4a373] text-white p-2 rounded-full shadow-md border-2 border-[#fdfcf8]">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      {/* User Info */}
      <h2
        id="explorer-name"
        className="text-3xl font-serif text-[#2d3436] mb-1"
      >
        {user.name}
      </h2>
      <div className="flex items-center gap-1.5 text-xs text-[#7f8c8d] mb-5">
        <Mail className="w-3.5 h-3.5 text-[#d4a373]" />
        <span>{user.email}</span>
      </div>

      {/* Travel Preferences Tag */}
      {user.travelStyle && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] text-[#333533] text-xs font-medium">
            <Luggage className="w-3 h-3 text-[#d4a373]" />
            Style: {user.travelStyle}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] text-[#7f8c8d] text-xs font-medium">
            <Calendar className="w-3 h-3 text-[#7f8c8d]" />
            Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}

      {/* Status callout */}
      <div className="w-full bg-[#f5f5f0]/80 border border-[#e0e0d5] rounded-2xl p-5 mb-6 text-left">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#5d6d5a] text-[#fdfcf8] flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-semibold text-[#2d3436]">
              GlobeTrotter Onboarding Complete
            </h4>
            <p className="text-[11px] text-[#7f8c8d]">
              Profile registered and saved locally
            </p>
          </div>
        </div>
        <p className="text-xs text-[#333533]/80 leading-relaxed">
          Your travel profile and photo are ready. You can now request the second page (Itinerary Planner &amp; Trip Map) whenever you wish.
        </p>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3">
        <button
          id="btn-edit-profile"
          type="button"
          onClick={onEditOrSignOut}
          className="w-full py-3.5 px-4 rounded-2xl border border-[#e0e0d5] text-[#333533] text-sm font-medium hover:bg-[#f5f5f0] transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-[#7f8c8d]" />
          Switch Profile
        </button>

        <button
          id="btn-page2-ready-hint"
          type="button"
          onClick={() => {
            alert('Your account is set up with Natural Tones design! You can now ask to build Page 2.');
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-sm font-semibold shadow-xl shadow-[#5d6d5a]/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Ready for Page 2</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
