export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string | null;
  bio?: string;
  homeCity?: string;
  travelStyle?: string;
  createdAt: string;
}

export type AuthMode = 'signup' | 'login';

export type DashboardTab =
  | 'dashboard'
  | 'ai-assistant'
  | 'map'
  | 'browse-destinations'
  | 'itinerary-planner'
  | 'budget-planner'
  | 'activity-suggestions'
  | 'trip-history'
  | 'upcoming-trips'
  | 'saved-trips'
  | 'profile'
  | 'settings'
  | 'help';

export interface Trip {
  id: string;
  userId?: string;
  title: string;
  destination: string;
  country: string;
  flag: string;
  startDate: string;
  endDate: string;
  startsInDays: number;
  progressPercent: number;
  coverImage: string;
  budget: number;
  spent: number;
  status: 'upcoming' | 'completed';
  companions: string[];
  notes?: string;
  activitiesCount?: number;
  lat?: number;
  lon?: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  flag: string;
  category: 'mountain' | 'beach' | 'cultural' | 'city';
  image: string;
  rating: number;
  reviewsCount: number;
  avgCostPerDay: number;
  bestMonths: string;
  description: string;
  highlights: string[];
  isSaved: boolean;
  lat?: number;
  lon?: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  location: string;
  category: 'Relaxation' | 'Sightseeing' | 'Dining' | 'Transport' | 'Adventure';
  cost: number;
  completed: boolean;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  theme: string;
  activities: ActivityItem[];
}

export interface TransitOption {
  mode: string;
  title: string;
  duration: string;
  cost: number;
  provider: string;
  frequency: string;
}

export interface PlaceToDiscover {
  name: string;
  category: string;
  rating: number;
  time: string;
  description: string;
  tip: string;
  googleMapsUrl?: string;
}

export interface HotelRecommendation {
  name: string;
  tier: 'Luxury' | 'Boutique' | 'Comfort' | 'Budget';
  rating: number;
  pricePerNight: number;
  area: string;
  amenities: string[];
  googleMapsUrl?: string;
}

export interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  rating: number;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  mustTry: string;
  neighborhood: string;
  googleMapsUrl?: string;
}

export interface ReviewItem {
  author: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
}

export interface AITripPlan {
  title: string;
  origin: string;
  destination: string;
  durationDays: number;
  budgetLevel: string;
  travelStyle: string;
  companions: string;
  flag: string;
  country: string;
  lat: number;
  lon: number;
  safetyScore: number;
  currency: string;
  plugType: string;
  transitOptions: TransitOption[];
  placesToDiscover: PlaceToDiscover[];
  hotels: HotelRecommendation[];
  restaurants: RestaurantRecommendation[];
  reviews: ReviewItem[];
  daySchedules: DayItinerary[];
  costBreakdown: {
    flights: number;
    lodging: number;
    foodAndDining: number;
    activities: number;
    total: number;
  };
  packingAdvice: string[];
}
