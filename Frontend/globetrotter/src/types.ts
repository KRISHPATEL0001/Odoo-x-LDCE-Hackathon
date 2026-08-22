export interface UserProfile {
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
