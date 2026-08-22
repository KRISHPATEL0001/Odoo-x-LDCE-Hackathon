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
      title: 'Tandem Paragliding over Jungfrau & Lake Thun',
      location: 'Interlaken, Switzerland',
      category: 'Adventure',
      duration: '2.5 hours',
      rating: 4.98,
      cost: 14500,
      image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=700&q=80',
      description: 'Soar with a certified pilot over turquoise alpine lakes and snowcapped Swiss peaks.',
      difficulty: 'Moderate',
    },
    {
      id: 'sug-2',
      title: 'Sacred Waterfall & Rice Terrace Walk',
      location: 'Ubud, Bali',
      category: 'Scenic',
      duration: '4 hours',
      rating: 4.92,
      cost: 2800,
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=700&q=80',
      description: 'Hidden cascade pools surrounded by jungle canopy and centuries-old Subak water channels.',
      difficulty: 'Easy',
    },
    {
      id: 'sug-3',
      title: 'Private Louvre After-Hours Curator Tour',
      location: 'Paris, France',
      category: 'Culture',
      duration: '3 hours',
      rating: 4.95,
      cost: 8500,
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80',
      description: 'Skip the daytime crowds and admire masterpieces under dramatic museum lighting.',
      difficulty: 'Easy',
    },
    {
      id: 'sug-4',
      title: 'Old Manali Apple Orchard Organic Brunch',
      location: 'Manali, India',
      category: 'Food',
      duration: '2 hours',
      rating: 4.88,
      cost: 1600,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
      description: 'Farm-to-table Himalayan sourdough, fresh cider, and wildflower honey with panoramic mountain views.',
      difficulty: 'Easy',
    },
    {
      id: 'sug-5',
      title: 'Sunset Desert Dune Buggy & Bedouin Camp',
      location: 'Dubai, UAE',
      category: 'Adventure',
      duration: '5 hours',
      rating: 4.91,
      cost: 9200,
      image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=700&q=80',
      description: 'High-octane red dune cruising followed by traditional oud music and stargazing.',
      difficulty: 'Moderate',
    },
    {
      id: 'sug-6',
      title: 'Zen Bamboo Forest Morning Tea Ceremony',
      location: 'Kyoto, Japan',
      category: 'Relaxation',
      duration: '2.5 hours',
      rating: 4.97,
      cost: 4200,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80',
      description: 'Meditative matcha preparation inside a private Arashiyama heritage garden.',
      difficulty: 'Easy',
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
                  <div className="flex items-center gap-1.5 text-xs text-[#7f8c8d] mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5d6d5a]" />
                    <span>{sug.location}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#2d3436] mb-2 leading-snug">
                    {sug.title}
                  </h3>

                  <p className="text-xs text-[#7f8c8d] line-clamp-2 leading-relaxed mb-4">
                    {sug.description}
                  </p>

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
