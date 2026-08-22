import { ActivityItem, DayItinerary, Trip } from '../types.ts';

/**
 * Safely parse dates in various formats (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, Month D, YYYY)
 * Anchors time to local noon (12:00:00) to prevent timezone boundary drift.
 */
export function parseDateSafe(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (!str) return null;

  // Format 1: YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  // Format 2: DD/MM/YYYY or DD-MM-YYYY (common in India / Europe)
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(str)) {
    const parts = str.split(/[\/\-]/).map(Number);
    const d = parts[0];
    const m = parts[1];
    const y = parts[2];
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  // Format 3: Month D, YYYY or standard parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0);
  }

  return null;
}

/**
 * Format a Date object to a readable string (e.g. "Aug 23, 2026")
 */
export function formatDateReadable(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate total trip duration in days accurately.
 * E.g., 23/08/2026 to 24/08/2026 is 2 days.
 * 23/08/2026 to 23/08/2026 is 1 day.
 */
export function calculateTripDurationDays(startDateStr?: string, endDateStr?: string): number {
  if (!startDateStr || !endDateStr) return 2;
  const start = parseDateSafe(startDateStr);
  const end = parseDateSafe(endDateStr);

  if (!start || !end) return 2;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export interface TripPhase {
  id: string;
  name: string;
  shortLabel: string;
  dayStart: number;
  dayEnd: number;
  dayNumbers: number[];
  emoji: string;
  theme: string;
}

/**
 * Divide journey by structured Day Sets (Phases) for easy navigation.
 * E.g. Days 1-3, Days 4-7, Days 8-9, etc.
 */
export function generateTripPhases(totalDays: number): TripPhase[] {
  const days = Math.max(1, totalDays);

  if (days <= 3) {
    return [
      {
        id: 'phase-1',
        name: `Days 1–${days}: Highlights & Exploration`,
        shortLabel: `Days 1–${days}`,
        dayStart: 1,
        dayEnd: days,
        dayNumbers: Array.from({ length: days }, (_, i) => i + 1),
        emoji: '🌟',
        theme: 'Core City Highlights & Top Sights',
      },
    ];
  }

  if (days >= 4 && days <= 6) {
    const p1End = 2;
    return [
      {
        id: 'phase-1',
        name: `Days 1–${p1End}: Arrival & Heritage Landmarks`,
        shortLabel: `Days 1–${p1End}`,
        dayStart: 1,
        dayEnd: p1End,
        dayNumbers: Array.from({ length: p1End }, (_, i) => i + 1),
        emoji: '🏛️',
        theme: 'Arrival, Iconic Sights & Old Town',
      },
      {
        id: 'phase-2',
        name: `Days ${p1End + 1}–${days}: Nature Trails & Scenic Adventures`,
        shortLabel: `Days ${p1End + 1}–${days}`,
        dayStart: p1End + 1,
        dayEnd: days,
        dayNumbers: Array.from({ length: days - p1End }, (_, i) => p1End + 1 + i),
        emoji: '🏔️',
        theme: 'Outdoor Excursions, Treks & Departure',
      },
    ];
  }

  if (days >= 7 && days <= 9) {
    return [
      {
        id: 'phase-1',
        name: 'Days 1–3: Historic Core & Primary Attractions',
        shortLabel: 'Days 1–3',
        dayStart: 1,
        dayEnd: 3,
        dayNumbers: [1, 2, 3],
        emoji: '🏛️',
        theme: 'Must-See Monuments & Cultural Centers',
      },
      {
        id: 'phase-2',
        name: 'Days 4–6: Mountain Peaks & Outdoor Excursions',
        shortLabel: 'Days 4–6',
        dayStart: 4,
        dayEnd: 6,
        dayNumbers: [4, 5, 6],
        emoji: '🏔️',
        theme: 'Summit Trails, Nature Parks & Day Trips',
      },
      {
        id: 'phase-3',
        name: `Days 7–${days}: Hidden Gems, Leisure & Farewell`,
        shortLabel: `Days 7–${days}`,
        dayStart: 7,
        dayEnd: days,
        dayNumbers: Array.from({ length: days - 6 }, (_, i) => 7 + i),
        emoji: '✨',
        theme: 'Local Markets, Food Walks & Departure',
      },
    ];
  }

  // 10+ Days (Long Journey)
  const phases: TripPhase[] = [
    {
      id: 'phase-1',
      name: 'Days 1–3: Urban Discovery & Main Heritage',
      shortLabel: 'Days 1–3',
      dayStart: 1,
      dayEnd: 3,
      dayNumbers: [1, 2, 3],
      emoji: '🏛️',
      theme: 'Arrival, Iconic Monuments & City Center',
    },
    {
      id: 'phase-2',
      name: 'Days 4–7: Regional Escapes & Scenic Nature',
      shortLabel: 'Days 4–7',
      dayStart: 4,
      dayEnd: 7,
      dayNumbers: [4, 5, 6, 7],
      emoji: '🏔️',
      theme: 'Valley Walks, Mountain Excursions & Lakes',
    },
    {
      id: 'phase-3',
      name: 'Days 8–10: Cultural Immersion & Food Trails',
      shortLabel: 'Days 8–10',
      dayStart: 8,
      dayEnd: 10,
      dayNumbers: [8, 9, 10],
      emoji: '🍜',
      theme: 'Authentic Local Cuisine, Temples & Workshops',
    },
  ];

  if (days > 10) {
    phases.push({
      id: 'phase-4',
      name: `Days 11–${days}: Relaxation, Souvenirs & Farewells`,
      shortLabel: `Days 11–${days}`,
      dayStart: 11,
      dayEnd: days,
      dayNumbers: Array.from({ length: days - 10 }, (_, i) => 11 + i),
      emoji: '🌅',
      theme: 'Leisurely Mornings, Shopping & Safe Journey Home',
    });
  }

  return phases;
}

/**
 * Generate full DayItinerary[] for a trip matching exact duration
 */
export function buildTripDaysSchedule(
  trip?: Trip,
  existingActivities: ActivityItem[] = []
): DayItinerary[] {
  if (!trip) return [];

  const totalDays = calculateTripDurationDays(trip.startDate, trip.endDate);
  const startDateObj = parseDateSafe(trip.startDate) || new Date();

  const days: DayItinerary[] = [];

  for (let i = 1; i <= totalDays; i++) {
    const dayDate = new Date(startDateObj.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
    const readableDate = formatDateReadable(dayDate);

    let theme = `Day ${i} Discovery & Sightseeing`;
    if (i === 1) {
      theme = 'Arrival & Welcome Highlights';
    } else if (i === totalDays && totalDays > 1) {
      theme = 'Final Farewell, Souvenirs & Departure';
    } else if (i === 2) {
      theme = 'Historic Monuments & Scenic Peaks';
    } else if (i === 3) {
      theme = 'Local Culinary Trails & Culture';
    } else if (i === 4) {
      theme = 'Nature Excursions & Hidden Spots';
    } else if (i === 5) {
      theme = 'Artisans, Markets & Sunset Views';
    }

    const dayActivities = existingActivities.filter((a) => (a.dayNumber || 1) === i);

    days.push({
      dayNumber: i,
      date: readableDate,
      theme,
      activities: dayActivities,
    });
  }

  return days;
}
