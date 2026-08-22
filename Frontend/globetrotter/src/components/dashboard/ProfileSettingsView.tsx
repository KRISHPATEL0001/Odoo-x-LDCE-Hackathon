import React, { useState } from 'react';
import { UserProfile } from '../../types.ts';
import {
  User,
  Mail,
  MapPin,
  Compass,
  ShieldCheck,
  Check,
  Camera,
  Globe,
  Bell,
  Sliders,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  user: UserProfile | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  activeSubSection?: 'profile' | 'settings' | 'help';
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  user,
  onUpdateProfile,
  activeSubSection = 'profile',
}) => {
  const [name, setName] = useState(user?.name || 'Krish Patel');
  const [email, setEmail] = useState(user?.email || 'krish@globetrotter.io');
  const [homeCity, setHomeCity] = useState(user?.homeCity || 'Mumbai, India');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || 'Scenic & Cultural');
  const [bio, setBio] = useState(user?.bio || 'Passionate traveler exploring mountain trails and cultural hidden gems.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      homeCity,
      travelStyle,
      bio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner */}
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
            <User className="w-3.5 h-3.5 text-[#d4a373]" />
            Traveler Account
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
            {activeSubSection === 'settings'
              ? 'Account & App Preferences'
              : activeSubSection === 'help'
              ? 'GlobeTrotter Support & Guide'
              : 'Explorer Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1">
            Manage your personal traveler details, travel persona, and notification preferences.
          </p>
        </div>
      </div>

      {activeSubSection === 'help' ? (
        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif font-bold text-lg text-[#2d3436]">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#f5f5f0]">
              <h4 className="font-bold text-[#2d3436] mb-1">
                How do I organize day-by-day itineraries?
              </h4>
              <p className="text-[#7f8c8d] leading-relaxed">
                Click on the "Itinerary Planner" tab in the sidebar. Select your trip from the dropdown and switch between Day 1, Day 2, etc. You can add new activities with exact times, costs, and locations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f5f0]">
              <h4 className="font-bold text-[#2d3436] mb-1">
                How does the Budget Planner work?
              </h4>
              <p className="text-[#7f8c8d] leading-relaxed">
                The Budget Planner lets you track expenses across flights, accommodation, food, activities, and shopping with multi-currency support (₹, $, €, £).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f5f0]">
              <h4 className="font-bold text-[#2d3436] mb-1">
                Can I switch between the Login and Dashboard views?
              </h4>
              <p className="text-[#7f8c8d] leading-relaxed">
                Yes! Use the "Switch / Sign Out" button at the bottom of the sidebar or top navigation menu anytime to return to the onboarding and authentication page.
              </p>
            </div>
          </div>
        </div>
      ) : activeSubSection === 'settings' ? (
        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif font-bold text-lg text-[#2d3436]">
            General Preferences
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f5f5f0]">
              <div>
                <p className="font-bold text-[#2d3436]">Trip Reminders &amp; Push Alerts</p>
                <p className="text-[#7f8c8d]">Receive alerts 5 days prior to upcoming departures</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#5d6d5a]" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f5f5f0]">
              <div>
                <p className="font-bold text-[#2d3436]">Live Weather Forecasts</p>
                <p className="text-[#7f8c8d]">Show climate and pack suggestions for destinations</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#5d6d5a]" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f5f5f0]">
              <div>
                <p className="font-bold text-[#2d3436]">Design Theme: Natural Tones</p>
                <p className="text-[#7f8c8d]">Warm natural palette (#5d6d5a sage &amp; #d4a373 sand)</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#5d6d5a] text-white text-[10px] font-bold">
                Active
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Profile Form */
        <form
          onSubmit={handleSave}
          className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 space-y-6"
        >
          {/* Avatar and Top Info */}
          <div className="flex items-center gap-5 pb-6 border-b border-[#e0e0d5]">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#d4a373] bg-[#f5f5f0] shadow-sm">
              <img
                src={
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                }
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2d3436]">
                {name}
              </h3>
              <p className="text-xs text-[#7f8c8d]">{email}</p>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#5d6d5a]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Explorer Account
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Home City / Departure Base
              </label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                Travel Style Persona
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              >
                <option value="Scenic & Cultural">Scenic &amp; Cultural Explorer</option>
                <option value="Mountain Adventurer">Mountain &amp; Trek Adventurer</option>
                <option value="Luxury & Wellness">Luxury &amp; Wellness Escapes</option>
                <option value="Backpacker & Budget">Backpacker &amp; Budget Traveler</option>
                <option value="Culinary & Foodie">Culinary &amp; Foodie</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
              Travel Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-xs text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#e0e0d5]">
            {savedSuccess ? (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile saved successfully!
              </span>
            ) : (
              <span className="text-xs text-[#7f8c8d]">
                Changes sync automatically to your dashboard
              </span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
