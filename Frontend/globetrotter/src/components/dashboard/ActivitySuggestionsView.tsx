import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Star,
  Clock,
  MapPin,
  Check,
  Plus,
  Flame,
  Filter,
} from 'lucide-react';

interface SuggestedActivity {
  id: string;
  title: string;
  location: string;
  category: 'Adventure' | 'Culture' | 'Food' | 'Scenic' | 'Relaxation';
  duration: string;
  rating: number;
  cost: number;
  image: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  mapsUrl?: string;
}

interface ActivitySuggestionsViewProps {
  currency: string;
  onAddActivityToTrip: (activityTitle: string) => void;
}

export const ActivitySuggestionsView: React.FC<ActivitySuggestionsViewProps> = ({
  currency,
  onAddActivityToTrip,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const suggestions: SuggestedActivity[] = [
    {
      id: 'sug-1',
      title: 'Tandem Paragliding — Interlaken',
      location: 'Skywings Paragliding, Hauptstrasse 15, 3800 Interlaken, Switzerland',
      category: 'Adventure',
      duration: '2.5 hours',
      rating: 4.98,
      cost: 14500,
      image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=700&q=80',
      description: 'Soar with a certified pilot over turquoise alpine lakes and snowcapped Swiss peaks.',
      difficulty: 'Moderate',
      mapsUrl: 'https://maps.google.com/?q=Skywings+Paragliding+Interlaken+Switzerland',
    },
    {
      id: 'sug-2',
      title: 'Sacred Monkey Forest Sanctuary Walk',
      location: 'Jl. Monkey Forest, Padangtegal, Ubud, Kabupaten Gianyar, Bali 80571',
      category: 'Scenic',
      duration: '2 hours',
      rating: 4.65,
      cost: 800,
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=700&q=80',
      description: 'Ancient Hindu temples hidden among towering fig trees and friendly macaques in Ubud.',
      difficulty: 'Easy',
      mapsUrl: 'https://maps.google.com/?q=Mandapa+Ritz+Carlton+Reserve+Ubud+Bali',
    },
    {
      id: 'sug-3',
      title: 'Louvre Museum Skip-the-Line Tour',
      location: 'Rue de Rivoli, 75001 Paris, France',
      category: 'Culture',
      duration: '3 hours',
      rating: 4.80,
      cost: 6500,
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80',
      description: 'Guided tour of da Vinci masterpieces, Egyptian antiquities & the Mona Lisa Gallery.',
      difficulty: 'Easy',
      mapsUrl: 'https://maps.google.com/?q=Louvre+Museum+Paris+France',
    },
    {
      id: 'sug-4',
      title: 'Café Lota — NCMA Restaurant',
      location: 'National Crafts Museum, Bhairon Marg, Pragati Maidan, New Delhi 110001',
      category: 'Food',
      duration: '1.5 hours',
      rating: 4.6,
      cost: 1200,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
      description: 'Award-winning café celebrating regional Indian cuisine inside the National Crafts Museum.',
      difficulty: 'Easy',
      mapsUrl: 'https://maps.google.com/?q=Cafe+Lota+National+Crafts+Museum+New+Delhi',
    },
    {
      id: 'sug-5',
      title: 'Dubai Desert Safari & Bedouin Dinner',
      location: 'Desert Rose Tourism, 37 Financial Centre Rd, Dubai, UAE',
      category: 'Adventure',
      duration: '6 hours',
      rating: 4.88,
      cost: 9200,
      image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=700&q=80',
      description: 'Dune bashing, camel riding, and starlit Bedouin camp dinner in the Lahbab desert.',
      difficulty: 'Moderate',
      mapsUrl: 'https://maps.google.com/?q=Al+Maha+Desert+Resort+Dubai+UAE',
    },
    {
      id: 'sug-6',
      title: 'Arashiyama Bamboo Grove Morning Walk',
      location: 'Sagatenryuji Susukinobabacho, Ukyo Ward, Kyoto 616-8385, Japan',
      category: 'Scenic',
      duration: '1.5 hours',
      rating: 4.75,
      cost: 0,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80',
      description: 'Walk through the iconic towering bamboo corridor in Arashiyama — best at sunrise.',
      difficulty: 'Easy',
      mapsUrl: 'https://maps.google.com/?q=Arashiyama+Bamboo+Grove+Kyoto+Japan',
    },
    {
      id: 'sug-7',
      title: 'Taj Lake Palace — Royal Dinner Cruise',
      location: 'Lake Pichola, Udaipur, Rajasthan 313001, India',
      category: 'Relaxation',
      duration: '3 hours',
      rating: 4.95,
      cost: 8500,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=700&q=80',
      description: 'Dine on Rajasthani cuisine while gliding across Lake Pichola with views of the City Palace.',
      difficulty: 'Easy',
      mapsUrl: 'https://maps.google.com/?q=Taj+Lake+Palace+Udaipur+Rajasthan',
    },
    {
      id: 'sug-8',
      title: 'Colosseum Underground Private Tour',
      location: 'Piazza del Colosseo 1, 00184 Roma RM, Italy',
      category: 'Culture',
      duration: '2 hours',
      rating: 4.90,
      cost: 7800,
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=700&q=80',
      description: 'Exclusive underground access to gladiator passages beneath the ancient Roman arena.',
      difficulty: 'Easy',
      mapsUrl: 'https://maps.google.com/?q=Colosseum+Rome+Italy',
    },
    {
      id: 'sug-9',
      title: 'Noma-Style Tasting Menu — Copenhagen',
      location: 'Refshalevej 96, 1432 Copenhagen, Denmark',
      category: 'Food',
      duration: '3 hours',
      rating: 4.97,
      cost: 22000,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=80',
      description: 'Legendary Nordic fine-dining experience; 20-course hyper-seasonal ingredient journey.',
      difficulty: 'Easy',
      mapsUrl: 'https://maps.google.com/?q=Noma+Restaurant+Copenhagen+Denmark',
    },
  ];

  const filtered = suggestions.filter(
    (s) => selectedTag === 'all' || s.category === selectedTag
  );

  const handleAdd = (sug: SuggestedActivity) => {
    setAddedIds((prev) => ({ ...prev, [sug.id]: true }));
    onAddActivityToTrip(sug.title);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
          Curated Explorer Recommendations
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
          Handpicked Activity Suggestions
        </h2>
        <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1 max-w-xl">
          Top-rated excursions and experiences recommended by experienced travelers for your upcoming destinations.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {['all', 'Adventure', 'Scenic', 'Culture', 'Food', 'Relaxation'].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-xs'
                    : 'bg-[#fdfcf8] text-[#333533] hover:bg-[#e9e9e0] border border-[#e0e0d5]'
                }`}
              >
                {tag === 'all' ? 'All Activities' : tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid of Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((sug) => {
          const isAdded = !!addedIds[sug.id];
          return (
            <div
              key={sug.id}
              className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#5d6d5a]/60 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={sug.image}
                    alt={sug.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                  <div className="absolute top-3 left-3 bg-[#fdfcf8]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#2d3436] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#d4a373] fill-[#d4a373]" />
                    <span>{sug.rating}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-white">
                    {sug.difficulty}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-1.5 text-xs text-[#7f8c8d] mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5d6d5a] mt-0.5 shrink-0" />
                    <span className="line-clamp-2 leading-snug">{sug.location}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#2d3436] mb-2 leading-snug">
                    {sug.title}
                  </h3>

                  <p className="text-xs text-[#7f8c8d] line-clamp-2 leading-relaxed mb-3">
                    {sug.description}
                  </p>

                  {sug.mapsUrl && (
                    <a
                      href={sug.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#5d6d5a] hover:text-[#4a5748] hover:underline mb-3"
                    >
                      <MapPin className="w-3 h-3" />
                      View on Google Maps
                    </a>
                  )}

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[#e0e0d5]/60">
                    <span className="flex items-center gap-1 text-[#7f8c8d]">
                      <Clock className="w-3.5 h-3.5 text-[#5d6d5a]" />
                      {sug.duration}
                    </span>
                    <span className="font-bold text-[#2d3436]">
                      {currency}
                      {sug.cost.toLocaleString()} / person
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  disabled={isAdded}
                  onClick={() => handleAdd(sug)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Added to Itinerary</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Itinerary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
