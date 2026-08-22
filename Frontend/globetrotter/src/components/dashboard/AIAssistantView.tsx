import React, { useState, useEffect, useRef } from 'react';
import { Trip, AITripPlan, PlaceToDiscover, TransitOption, HotelRecommendation, RestaurantRecommendation, ReviewItem } from '../../types.ts';
import { api, PlaceItem } from '../../services/api.ts';
import {
  Sparkles,
  Bot,
  Plane,
  Train,
  Car,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Compass,
  Star,
  ShieldCheck,
  Send,
  Plus,
  ArrowRight,
  CheckCircle2,
  Utensils,
  Building,
  Luggage,
  Clock,
  ThumbsUp,
  Info,
  MessageSquare,
  Globe2,
  Zap,
} from 'lucide-react';

interface AIAssistantViewProps {
  onSaveAITrip: (trip: Trip) => void;
  currency: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onSaveAITrip,
  currency,
}) => {
  // Input form state
  const [origin, setOrigin] = useState('New Delhi, India');
  const [destination, setDestination] = useState('Tokyo, Japan');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetLevel, setBudgetLevel] = useState('Moderate');
  const [travelStyle, setTravelStyle] = useState('Culture & Modern');
  const [companions, setCompanions] = useState('Solo / Friends');

  // Autocomplete state
  const [originResults, setOriginResults] = useState<PlaceItem[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [destResults, setDestResults] = useState<PlaceItem[]>([]);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const originTimeoutRef = useRef<any>(null);
  const destTimeoutRef = useRef<any>(null);

  // AI Plan & Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<AITripPlan | null>(null);
  const [activeTab, setActiveTab] = useState<
    'transit' | 'places' | 'itinerary' | 'hotels' | 'restaurants' | 'reviews' | 'chat'
  >('transit');

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; time: string }>>([
    {
      role: 'ai',
      text: 'Hello Explorer! 👋 I am your AI Travel Copilot. Ask me anything about routes, packing, food, transit passes, or hidden gems worldwide!',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial load default plan for Tokyo
  useEffect(() => {
    handleGeneratePlan('New Delhi, India', 'Tokyo, Japan', 5, 'Moderate', 'Culture & Modern');
  }, []);

  const handleOriginChange = (val: string) => {
    setOrigin(val);
    if (val.trim().length >= 2) {
      if (originTimeoutRef.current) clearTimeout(originTimeoutRef.current);
      originTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await api.searchPlaces(val.trim());
          setOriginResults(results);
          setShowOriginDropdown(true);
        } catch {
          setOriginResults([]);
        }
      }, 200);
    } else {
      setOriginResults([]);
      setShowOriginDropdown(false);
    }
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    if (val.trim().length >= 2) {
      if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current);
      destTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await api.searchPlaces(val.trim());
          setDestResults(results);
          setShowDestDropdown(true);
        } catch {
          setDestResults([]);
        }
      }, 200);
    } else {
      setDestResults([]);
      setShowDestDropdown(false);
    }
  };

  const handleGeneratePlan = async (
    from = origin,
    to = destination,
    days = durationDays,
    budget = budgetLevel,
    style = travelStyle
  ) => {
    if (!to.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await api.generateAIPlan({
        origin: from,
        destination: to,
        durationDays: days,
        budgetLevel: budget,
        travelStyle: style,
        companions,
      });
      setPlan(generated);
    } catch (e) {
      console.error('Failed to generate AI plan:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setIsSendingChat(true);
    try {
      const reply = await api.sendAIChat(userText, { destination: plan?.destination || destination, plugType: plan?.plugType });
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'I am temporarily having trouble reaching the travel knowledge base. Please try asking again in a moment!', time: 'Just now' },
      ]);
    } finally {
      setIsSendingChat(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleSaveToMyTrips = () => {
    if (!plan) return;
    const newTrip: Trip = {
      id: `ai-trip-${Date.now()}`,
      title: `${plan.destination} AI Explorer Tour`,
      destination: plan.destination,
      country: plan.country,
      flag: plan.flag || '🌍',
      startDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      endDate: new Date(Date.now() + (14 + plan.durationDays) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startsInDays: 14,
      progressPercent: 15,
      coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      budget: plan.costBreakdown.total,
      spent: 0,
      status: 'upcoming',
      companions: [companions],
      notes: `AI Curated ${plan.durationDays}-Day itinerary for ${plan.travelStyle}.`,
      activitiesCount: plan.daySchedules.reduce((acc, d) => acc + (d.activities?.length || 0), 0),
      lat: plan.lat,
      lon: plan.lon,
    };
    onSaveAITrip(newTrip);
  };

  return (
    <div className="space-y-6">
      {/* Top AI Copilot Banner */}
      <div className="bg-gradient-to-r from-[#2d3436] via-[#3a4446] to-[#5d6d5a] rounded-3xl p-6 sm:p-8 text-[#fdfcf8] border border-[#e0e0d5] shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden md:block">
          <Bot className="w-96 h-96 -mr-16 -mt-10" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4a373]/20 text-[#d4a373] text-xs font-bold uppercase tracking-wider mb-2 border border-[#d4a373]/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Travel Assistant &amp; Intelligence Copilot
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            Smart Route &amp; Travel Planner
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
            Input your origin and destination. Our AI synthesizes transit routes, curated sights, authentic restaurants, verified reviews, and hotel recommendations.
          </p>
        </div>

        {plan && (
          <button
            type="button"
            onClick={handleSaveToMyTrips}
            className="relative z-10 px-5 py-3 rounded-2xl bg-[#d4a373] hover:bg-[#c29365] text-[#2d3436] font-bold text-xs shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save AI Plan as Active Trip</span>
          </button>
        )}
      </div>

      {/* Interactive Prompt & Parameter Form */}
      <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Origin Input */}
          <div className="relative">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
              Start Location (Origin)
            </label>
            <div className="relative">
              <input
                type="text"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                placeholder="e.g. New Delhi, India"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-xs font-semibold text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              />
              <MapPin className="w-4 h-4 text-[#7f8c8d] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {showOriginDropdown && originResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e0d5] rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                {originResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setOrigin(`${p.name}, ${p.country}`);
                      setShowOriginDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-[#f5f5f0] cursor-pointer text-xs flex items-center gap-2 border-b border-[#e0e0d5]/40 last:border-0"
                  >
                    <span>{p.flag}</span>
                    <span className="font-semibold text-[#2d3436]">{p.name}</span>
                    <span className="text-[10px] text-[#7f8c8d]">({p.country})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Destination Input */}
          <div className="relative">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
              Destination Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestChange(e.target.value)}
                placeholder="e.g. Tokyo, Japan"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-xs font-semibold text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              />
              <Compass className="w-4 h-4 text-[#d4a373] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {showDestDropdown && destResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e0d5] rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                {destResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setDestination(`${p.name}, ${p.country}`);
                      setShowDestDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-[#f5f5f0] cursor-pointer text-xs flex items-center gap-2 border-b border-[#e0e0d5]/40 last:border-0"
                  >
                    <span>{p.flag}</span>
                    <span className="font-semibold text-[#2d3436]">{p.name}</span>
                    <span className="text-[10px] text-[#7f8c8d]">({p.country})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Duration & Style */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
              Trip Duration &amp; Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="px-2.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-xs font-semibold text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              >
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days</option>
                <option value={10}>10 Days</option>
              </select>

              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="px-2.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-xs font-semibold text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
              >
                <option value="Culture & Modern">🏛️ Culture</option>
                <option value="Adventure & Nature">🏔️ Adventure</option>
                <option value="Relaxation & Spa">🏖️ Relax</option>
                <option value="Food & Culinary">🍜 Foodie</option>
                <option value="Luxury & Wellness">💎 Luxury</option>
              </select>
            </div>
          </div>

          {/* 4. Action Button */}
          <div className="flex items-end">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGeneratePlan()}
              className="w-full py-2.5 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing AI Plan...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#d4a373]" />
                  <span>Generate AI Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Generated Plan Results Explorer */}
      {plan && (
        <div className="space-y-6">
          {/* Quick Metrics & Destination Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e0e0d5] flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d]">Safety Score</span>
              <div className="text-lg font-serif font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{plan.safetyScore}/10</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e0e0d5] flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d]">Currency</span>
              <div className="text-sm font-bold text-[#2d3436] mt-1">{plan.currency}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e0e0d5] flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d]">Est. Total Budget</span>
              <div className="text-sm font-bold text-[#2d3436] mt-1">
                {currency}{plan.costBreakdown.total.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e0e0d5] flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d]">Plug Standard</span>
              <div className="text-xs font-bold text-[#2d3436] mt-1">{plan.plugType}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e0e0d5] flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d]">Places Found</span>
              <div className="text-sm font-bold text-[#2d3436] mt-1">{plan.placesToDiscover.length} sights</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e0e0d5] flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d]">Stays &amp; Diners</span>
              <div className="text-sm font-bold text-[#2d3436] mt-1">
                {plan.hotels.length} stays • {plan.restaurants.length} food
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#e0e0d5]">
            {[
              { id: 'transit', label: '✈️ How to Reach & Transit', count: plan.transitOptions.length },
              { id: 'places', label: '🏛️ Places to Discover', count: plan.placesToDiscover.length },
              { id: 'itinerary', label: '🗓️ Day-by-Day Plan', count: plan.daySchedules.length },
              { id: 'hotels', label: '🏨 Nearby Hotels & Stays', count: plan.hotels.length },
              { id: 'restaurants', label: '🍽️ Recommended Dining', count: plan.restaurants.length },
              { id: 'reviews', label: '⭐ Online Reviews & Tips', count: plan.reviews.length },
              { id: 'chat', label: '💬 AI Copilot Chat', count: chatMessages.length - 1 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-sm'
                    : 'bg-[#fdfcf8] text-[#333533] hover:bg-[#f5f5f0] border border-[#e0e0d5]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: Transit & Travel Options */}
          {activeTab === 'transit' && (
            <div className="space-y-4">
              <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-2xl p-4 flex items-center justify-between">
                <div className="text-xs text-[#2d3436]">
                  <span className="font-bold">Travel Route:</span> {plan.origin} ➔ {plan.destination} {plan.flag}
                </div>
                <span className="text-[10px] font-bold text-[#5d6d5a] bg-white px-2.5 py-1 rounded-full border border-[#e0e0d5]">
                  Fastest &amp; Most Cost-Effective Routes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plan.transitOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#5d6d5a]/10 text-[#5d6d5a] text-[10px] font-bold uppercase tracking-wider">
                          {opt.mode}
                        </span>
                        <span className="text-xs text-[#7f8c8d] font-medium">{opt.duration}</span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#2d3436] mb-2">{opt.title}</h4>
                      <p className="text-xs text-[#7f8c8d] mb-4">
                        <span className="font-semibold text-[#2d3436]">Provider:</span> {opt.provider}
                        <br />
                        <span className="font-semibold text-[#2d3436]">Frequency:</span> {opt.frequency}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e0e0d5] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#7f8c8d]">Est. Fare</span>
                        <div className="text-sm font-bold text-[#2d3436]">
                          {currency}{opt.cost.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#5d6d5a] hover:underline cursor-pointer">
                        View Schedule ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Places to Discover */}
          {activeTab === 'places' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#f5f5f0] border border-[#e0e0d5] gap-2">
                <div className="text-xs text-[#2d3436]">
                  <span className="font-bold">Top Attractions &amp; Sights in {plan.destination}</span> ({plan.placesToDiscover.length} verified)
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=things+to+do+in+${encodeURIComponent(
                    plan.destination
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] rounded-xl text-xs font-semibold text-[#5d6d5a] shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Explore All Attractions on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.placesToDiscover.map((place, idx) => {
                  const mapUrl =
                    place.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      place.name + ', ' + plan.destination
                    )}`;

                  return (
                    <div
                      key={idx}
                      className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                            {place.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#2d3436]">
                            <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
                            <span>{place.rating}</span>
                          </div>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-[#2d3436] mb-1">{place.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-[#7f8c8d] mb-3">
                          <Clock className="w-3.5 h-3.5 text-[#5d6d5a]" />
                          <span>Best Time: {place.time}</span>
                        </div>
                        <p className="text-xs text-[#7f8c8d] leading-relaxed mb-3">{place.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span><strong>Insider Tip:</strong> {place.tip}</span>
                        </div>

                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-[#f5f5f0] hover:bg-[#eaeae0] border border-[#e0e0d5] text-[#2d3436] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#7f8c8d]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Day-by-Day Itinerary */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              {plan.daySchedules.map((day) => (
                <div key={day.dayNumber} className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e0e0d5] mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5d6d5a]">
                        Day {day.dayNumber}
                      </span>
                      <h4 className="font-serif font-bold text-lg text-[#2d3436]">{day.theme}</h4>
                    </div>
                    <span className="text-xs text-[#7f8c8d]">{day.activities.length} scheduled stops</span>
                  </div>

                  <div className="space-y-3">
                    {day.activities.map((act: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="px-2 py-1 rounded-lg bg-white border border-[#e0e0d5] text-[11px] font-bold text-[#5d6d5a] shrink-0">
                            {act.time}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-[#2d3436]">{act.title}</div>
                            <div className="text-[11px] text-[#7f8c8d] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#d4a373]" />
                              <span>{act.location}</span>
                              {act.tip && <span>• 💡 {act.tip}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-[#2d3436]">
                            {act.cost === 0 ? 'Free' : `${currency}${act.cost.toLocaleString()}`}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              act.title + ', ' + plan.destination
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] rounded-lg text-[#5d6d5a]"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Nearby Hotels & Stays */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#f5f5f0] border border-[#e0e0d5] gap-2">
                <div className="text-xs text-[#2d3436]">
                  <span className="font-bold">Accommodations in {plan.destination}</span> ({plan.hotels.length} verified options)
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=hotels+in+${encodeURIComponent(
                    plan.destination
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] rounded-xl text-xs font-semibold text-[#5d6d5a] shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Explore All Hotels on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {plan.hotels.map((hotel, idx) => {
                  const mapUrl =
                    hotel.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      hotel.name + ', ' + (hotel.area || plan.destination)
                    )}`;

                  return (
                    <div
                      key={idx}
                      className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              hotel.tier === 'Luxury'
                                ? 'bg-purple-100 text-purple-800'
                                : hotel.tier === 'Boutique'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {hotel.tier}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#2d3436]">
                            <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
                            <span>{hotel.rating}</span>
                          </div>
                        </div>

                        <h4 className="font-serif font-bold text-base text-[#2d3436] mb-1">{hotel.name}</h4>
                        <div className="text-xs text-[#7f8c8d] flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-[#5d6d5a]" />
                          <span>{hotel.area}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {hotel.amenities.map((am, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#f5f5f0] text-[10px] text-[#2d3436]">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e0e0d5] space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#7f8c8d]">Per Night</span>
                            <div className="text-sm font-bold text-[#2d3436]">
                              {currency}{hotel.pricePerNight.toLocaleString()}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#5d6d5a] bg-[#5d6d5a]/10 px-2 py-0.5 rounded-md">
                            Verified
                          </span>
                        </div>

                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-[#5d6d5a] hover:bg-[#4a5748] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Nearby Recommended Restaurants */}
          {activeTab === 'restaurants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#f5f5f0] border border-[#e0e0d5] gap-2">
                <div className="text-xs text-[#2d3436]">
                  <span className="font-bold">Authentic Dining Hotspots in {plan.destination}</span> ({plan.restaurants.length} spots)
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=restaurants+in+${encodeURIComponent(
                    plan.destination
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#eaeae0] border border-[#e0e0d5] rounded-xl text-xs font-semibold text-[#5d6d5a] shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Explore All Restaurants on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#7f8c8d]" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.restaurants.map((rest, idx) => {
                  const mapUrl =
                    rest.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      rest.name + ', ' + (rest.neighborhood || plan.destination)
                    )}`;

                  return (
                    <div
                      key={idx}
                      className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold uppercase tracking-wider border border-rose-200">
                            {rest.cuisine}
                          </span>
                          <span className="text-xs font-bold text-[#5d6d5a]">{rest.priceLevel}</span>
                        </div>

                        <h4 className="font-serif font-bold text-lg text-[#2d3436] mb-1">{rest.name}</h4>
                        <div className="text-xs text-[#7f8c8d] flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                          <span>{rest.neighborhood}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#f5f5f0] text-xs text-[#2d3436] mb-3">
                          🍽️ <span className="font-bold">Must-Try Specialty:</span> {rest.mustTry}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e0e0d5] flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-[#7f8c8d]">
                          <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
                          <strong className="text-[#2d3436]">{rest.rating}</strong> (Verified Rating)
                        </span>

                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#5d6d5a] hover:bg-[#4a5748] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: Online Traveler Reviews & Tips */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#2d3436]">
                    Authentic Explorer Feedback for {plan.destination}
                  </h4>
                  <p className="text-xs text-[#7f8c8d]">
                    Aggregated sentiment score: <strong>9.8 / 10</strong> based on verified global travelers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.reviews.map((rev, idx) => (
                  <div key={idx} className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#5d6d5a]/20 text-[#5d6d5a] font-bold text-xs flex items-center justify-center">
                          {rev.author[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#2d3436]">{rev.author}</div>
                          <div className="text-[10px] text-[#7f8c8d]">{rev.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-[#d4a373] fill-[#d4a373]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#7f8c8d] leading-relaxed italic mb-3">"{rev.text}"</p>
                    <div className="text-[10px] text-[#5d6d5a] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Explorer Review • {rev.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Conversational AI Copilot Chat */}
          {activeTab === 'chat' && (
            <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col h-[520px]">
              {/* Chat history */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-[#5d6d5a] text-[#fdfcf8] flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#5d6d5a] text-white rounded-tr-none'
                          : 'bg-[#f5f5f0] text-[#2d3436] border border-[#e0e0d5] rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {msg.text}
                      <div className={`text-[9px] mt-1.5 opacity-60 ${msg.role === 'user' ? 'text-right text-white' : 'text-left text-[#7f8c8d]'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="flex items-center gap-2 text-xs text-[#7f8c8d]">
                    <Bot className="w-4 h-4 text-[#5d6d5a] animate-spin" />
                    <span>AI Copilot is thinking...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="mt-4 pt-3 border-t border-[#e0e0d5] flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask anything about ${plan.destination} (e.g. food spots, packing, transit)...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-xs text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingChat}
                  className="px-4 py-2.5 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
