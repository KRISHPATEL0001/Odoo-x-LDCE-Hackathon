import React, { useState, useEffect } from 'react';
import { UserProfile } from './types.ts';
import { AuthForm } from './components/AuthForm.tsx';
import { DashboardPage } from './components/DashboardPage.tsx';
import { TravelShowcase } from './components/TravelShowcase.tsx';
import { Compass, Globe2, Plane } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Check if a user was previously logged in / signed up
  useEffect(() => {
    try {
      const saved = localStorage.getItem('globetrotter_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load user from localStorage', e);
    }
  }, []);

  const handleAuthSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
  };

  const handleSignOutOrEdit = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('globetrotter_user');
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
  };

  if (currentUser) {
    return <DashboardPage user={currentUser} onLogout={handleSignOutOrEdit} />;
  }

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-[#333533] flex flex-col selection:bg-[#d4a373]/20 selection:text-[#333533]">
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#e0e0d5] bg-[#fdfcf8]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5d6d5a] text-[#fdfcf8] flex items-center justify-center shadow-md shadow-[#5d6d5a]/20">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic font-semibold text-[#2d3436] tracking-tight text-2xl">
                GlobeTrotter
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-[#5d6d5a] bg-[#f5f5f0] px-2.5 py-0.5 rounded-full border border-[#e0e0d5] uppercase tracking-wider">
                Travel Planner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#7f8c8d]">
            <div className="hidden md:flex items-center gap-1.5 bg-[#f5f5f0] px-3.5 py-1.5 rounded-full border border-[#e0e0d5] text-[#5d6d5a] font-medium">
              <Plane className="w-3.5 h-3.5 text-[#d4a373] -rotate-45" />
              <span>Step 1: Explorer Registration</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#7f8c8d]">
              <Globe2 className="w-4 h-4 text-[#d4a373]" />
              <span>Page 1 of 2</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Travel Planner Visual Showcase (Desktop) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
            <TravelShowcase />
          </div>

          {/* Right Column: User Auth & Registration Form (Page 1) */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center">
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full border-t border-[#e0e0d5] py-4 bg-[#fdfcf8] text-center text-xs text-[#7f8c8d]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 GlobeTrotter Travel Planner. Explorer onboarding module.</p>
          <div className="flex items-center gap-3 text-[#7f8c8d]">
            <span>Natural Tones Aesthetic</span>
            <span>•</span>
            <span>Secure Passport Auth</span>
            <span>•</span>
            <span>Local Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
