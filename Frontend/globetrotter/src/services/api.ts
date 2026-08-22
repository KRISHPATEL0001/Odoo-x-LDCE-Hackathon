import { Destination, Trip, ActivityItem, UserProfile, AITripPlan } from '../types.ts';

const API_BASE = '/api';

function getCurrentUserFromStorage(): UserProfile | null {
  try {
    const raw = localStorage.getItem('globetrotter_user');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const currentUser = getCurrentUserFromStorage();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(currentUser?.email ? { 'x-user-email': currentUser.email } : {}),
    ...(currentUser && (currentUser as any).id ? { 'x-user-id': (currentUser as any).id } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body.error || body.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return body;
}

export const api = {
  // --- Destinations ---
  async getDestinations(category?: string, search?: string, userId?: string): Promise<Destination[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (userId) params.append('userId', userId);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; destinations: Destination[] }>(
      `/destinations${qs}`,
      { method: 'GET' }
    );
    return res.destinations || [];
  },

  async toggleSaveDestination(id: string, userId?: string): Promise<Destination> {
    const res = await request<{ success: boolean; destination: Destination }>(
      `/destinations/${id}/save`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
    return res.destination;
  },

  // --- Trips (Scoped to User) ---
  async getTrips(userId?: string, status?: string): Promise<Trip[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; trips: Trip[] }>(
      `/trips${qs}`,
      { method: 'GET' }
    );
    return res.trips || [];
  },

  async createTrip(tripData: Partial<Trip>, userId?: string): Promise<Trip> {
    const res = await request<{ success: boolean; trip: Trip }>(
      '/trips',
      {
        method: 'POST',
        body: JSON.stringify({
          ...tripData,
          userId: userId || tripData.userId,
        }),
      }
    );
    return res.trip;
  },

  async deleteTrip(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(
      `/trips/${id}`,
      { method: 'DELETE' }
    );
    return res.success;
  },

  // --- Activities ---
  async getActivities(tripId: string): Promise<ActivityItem[]> {
    const res = await request<{ success: boolean; activities: ActivityItem[] }>(
      `/trips/${tripId}/activities`,
      { method: 'GET' }
    );
    return res.activities || [];
  },

  async createActivity(
    tripId: string,
    activityData: {
      title: string;
      dayNumber: number;
      time?: string;
      location?: string;
      category?: string;
      cost?: number;
    }
  ): Promise<ActivityItem> {
    const res = await request<{ success: boolean; activity: ActivityItem }>(
      `/trips/${tripId}/activities`,
      {
        method: 'POST',
        body: JSON.stringify(activityData),
      }
    );
    return res.activity;
  },

  async toggleActivity(id: string): Promise<ActivityItem | null> {
    try {
      const res = await request<{ success: boolean; activity: ActivityItem }>(
        `/activities/${id}/toggle`,
        { method: 'PATCH' }
      );
      return res.activity;
    } catch {
      return null;
    }
  },

  async deleteActivity(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(
      `/activities/${id}`,
      { method: 'DELETE' }
    );
    return res.success;
  },

  // --- Expenses ---
  async getExpenses(tripId: string): Promise<any[]> {
    const res = await request<{ success: boolean; expenses: any[] }>(
      `/trips/${tripId}/expenses`,
      { method: 'GET' }
    );
    return res.expenses || [];
  },

  async createExpense(
    tripId: string,
    expenseData: {
      category: string;
      title: string;
      amount: number;
      date?: string;
    }
  ): Promise<any> {
    const res = await request<{ success: boolean; expense: any }>(
      `/trips/${tripId}/expenses`,
      {
        method: 'POST',
        body: JSON.stringify(expenseData),
      }
    );
    return res.expense;
  },

  async deleteExpense(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(
      `/expenses/${id}`,
      { method: 'DELETE' }
    );
    return res.success;
  },

  // --- Auth & User ---
  async login(email: string, password?: string): Promise<UserProfile> {
    const res = await request<{ success: boolean; user: UserProfile }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return res.user;
  },

  async register(userData: {
    name: string;
    email: string;
    password?: string;
    avatarUrl?: string | null;
    travelStyle?: string;
  }): Promise<UserProfile> {
    const res = await request<{ success: boolean; user: UserProfile }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    return res.user;
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await request<{ success: boolean; user: UserProfile }>(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }
    );
    return res.user;
  },

  // --- Worldwide Places & Geocoding ---
  async searchPlaces(query: string): Promise<PlaceItem[]> {
    const res = await request<{ success: boolean; places: PlaceItem[] }>(
      `/places/search?q=${encodeURIComponent(query)}`,
      { method: 'GET' }
    );
    return res.places || [];
  },

  // --- Live Weather ---
  async getWeather(city?: string, lat?: number, lon?: number): Promise<WeatherData | null> {
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (lat !== undefined) params.append('lat', String(lat));
      if (lon !== undefined) params.append('lon', String(lon));

      const res = await request<{ success: boolean; weather: WeatherData }>(
        `/weather?${params.toString()}`,
        { method: 'GET' }
      );
      return res.weather || null;
    } catch {
      return null;
    }
  },

  // --- Live Currency Rates ---
  async getCurrencyRates(): Promise<Record<string, number>> {
    try {
      const res = await request<{ success: boolean; rates: Record<string, number> }>(
        '/currency/rates',
        { method: 'GET' }
      );
      return res.rates || { INR: 1, USD: 86.5, EUR: 90.2, GBP: 108.4, JPY: 0.58 };
    } catch {
      return { INR: 1, USD: 86.5, EUR: 90.2, GBP: 108.4, JPY: 0.58 };
    }
  },

  // --- AI Travel Assistant & Copilot ---
  async generateAIPlan(params: {
    origin: string;
    destination: string;
    durationDays?: number;
    budgetLevel?: string;
    travelStyle?: string;
    companions?: string;
  }): Promise<AITripPlan> {
    const res = await request<{ success: boolean; plan: AITripPlan }>(
      '/ai/plan-trip',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
    return res.plan;
  },

  async sendAIChat(message: string, context?: any): Promise<string> {
    const res = await request<{ success: boolean; reply: string }>(
      '/ai/chat',
      {
        method: 'POST',
        body: JSON.stringify({ message, context }),
      }
    );
    return res.reply;
  },

  async getNearbyPlaces(city: string, type?: 'all' | 'hotels' | 'restaurants'): Promise<any> {
    const res = await request<any>(
      `/places/nearby?city=${encodeURIComponent(city)}&type=${type || 'all'}`,
      { method: 'GET' }
    );
    return res;
  },

  async getDestinationReviews(destination: string): Promise<any> {
    const res = await request<any>(
      `/reviews?destination=${encodeURIComponent(destination)}`,
      { method: 'GET' }
    );
    return res;
  },
};

export interface PlaceItem {
  id: string;
  name: string;
  displayName: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  lat: number;
  lon: number;
  type?: string;
  category?: string;
  rankingBadge?: string;
  isAutoPredicted?: boolean;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  emoji: string;
  icon: string;
}

export interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  emoji: string;
  icon: string;
  forecast: ForecastDay[];
  packingTip: string;
}
