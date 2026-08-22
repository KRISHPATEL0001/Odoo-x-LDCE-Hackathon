import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Globe2, Plane, Sparkles, Star } from 'lucide-react';

const FEATURED_DESTINATIONS = [
  {
    city: 'Kyoto',
    country: 'Japan',
    tagline: 'Ancient temples, bamboo groves & quiet tea houses',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    bestTime: 'Spring (Cherry Blossoms)',
    rating: '4.9',
  },
  {
    city: 'Amalfi Coast',
    country: 'Italy',
    tagline: 'Cliffside coastal villages and turquoise Mediterranean waters',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    bestTime: 'May – September',
    rating: '4.95',
  },
  {
    city: 'Banff National Park',
    country: 'Canada',
    tagline: 'Glacial lakes, pine forests & alpine peaks',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
    bestTime: 'June – August',
    rating: '4.9',
  },
  {
    city: 'Santorini',
    country: 'Greece',
    tagline: 'Whitewashed cliffside villas and caldera sunsets',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    bestTime: 'April – October',
    rating: '4.92',
  },
];

export const TravelShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_DESTINATIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = FEATURED_DESTINATIONS[currentIndex];

  return (
    <div
      id="travel-showcase-panel"
      className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#5d6d5a] text-[#fdfcf8] rounded-3xl shadow-xl shadow-[#5d6d5a]/15 min-h-[620px]"
    >
      {/* Background with crossfade effect */}
      {FEATURED_DESTINATIONS.map((dest, idx) => (
        <div
          key={dest.city}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-25 scale-105' : 'opacity-0 scale-100'
          } transition-transform duration-7000`}
        >
          <img
            src={dest.image}
            alt={`${dest.city}, ${dest.country}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Natural Tones Dot Matrix Background & Gradient */}
      <div className="absolute inset-0 natural-dot-matrix opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#5d6d5a]/90 via-[#5d6d5a]/80 to-[#4a5748]/95 pointer-events-none" />

      {/* Top Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#fdfcf8]/15 backdrop-blur-md flex items-center justify-center border border-[#fdfcf8]/25 text-[#fdfcf8]">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-[#d4a373] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                Planner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#fdfcf8]/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#fdfcf8]/20 text-xs text-[#fdfcf8]">
            <Globe2 className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>195+ Destinations</span>
          </div>
        </div>

        <h1 className="text-5xl font-serif italic tracking-tight mb-3 text-[#fdfcf8]">
          GlobeTrotter
        </h1>
        <p className="text-base sm:text-lg opacity-90 leading-relaxed font-light text-[#fdfcf8] max-w-md">
          Your journey begins with a single step. Map your dreams, track your adventures, and discover the world's hidden gems.
        </p>
      </div>

      {/* Center Inspiration Card */}
      <div className="relative z-10 my-auto py-6">
        <div className="bg-[#fdfcf8]/12 backdrop-blur-md border border-[#fdfcf8]/20 rounded-2xl p-5 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4a373]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider text-[10px]">Featured Destination</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#fdfcf8] font-medium">
              <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
              <span>{current.rating}</span>
            </div>
          </div>

          <h2 className="text-2xl font-serif text-[#fdfcf8] mb-1">
            {current.city},{' '}
            <span className="italic opacity-90">
              {current.country}
            </span>
          </h2>
          <p className="text-xs text-[#fdfcf8]/85 leading-relaxed mb-3">
            {current.tagline}
          </p>

          <div className="flex items-center justify-between text-xs text-[#fdfcf8]/90 pt-2 border-t border-[#fdfcf8]/15">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
              Best Season: {current.bestTime}
            </span>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="flex items-center gap-2 mt-4">
          {FEATURED_DESTINATIONS.map((_, i) => (
            <button
              key={i}
              id={`carousel-indicator-${i}`}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-7 bg-[#d4a373]'
                  : 'w-2 bg-[#fdfcf8]/30 hover:bg-[#fdfcf8]/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Step Indicator Section */}
      <div className="relative z-10">
        <div className="flex gap-2 mb-4">
          <div className="w-12 h-[2px] bg-[#fdfcf8]"></div>
          <div className="w-12 h-[2px] bg-[#fdfcf8] opacity-30"></div>
          <div className="w-12 h-[2px] bg-[#fdfcf8] opacity-30"></div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <p className="text-xs uppercase tracking-widest opacity-70">
            Step 01 — Personalize &amp; Onboard
          </p>
          <div className="flex items-center gap-1.5 opacity-80">
            <Plane className="w-3.5 h-3.5 text-[#d4a373] -rotate-45" />
            <span>Itinerary Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
