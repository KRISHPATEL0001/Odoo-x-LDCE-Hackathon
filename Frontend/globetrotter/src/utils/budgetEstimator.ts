/**
 * Smart destination-aware daily budget estimator (in INR).
 * Estimates realistic per-day travel cost based on destination cost-of-living tiers.
 * Covers flights (amortized), lodging, food, local transport, and activities.
 */

export interface BudgetEstimate {
  perDay: number;
  total: number;
  tier: 'Ultra-Luxury' | 'Premium' | 'Moderate' | 'Budget';
  breakdown: {
    flightsPerDay: number;
    lodgingPerDay: number;
    foodPerDay: number;
    activitiesPerDay: number;
    transportPerDay: number;
  };
}

/** Destination → estimated per-day cost in INR (including all categories) */
const DESTINATION_DAILY_BUDGETS: Record<string, number> = {
  // ── Ultra-Luxury (₹25,000–₹60,000/day) ──────────────────────────
  'maldives': 60000,
  'monaco': 60000,
  'switzerland': 55000,
  'interlaken': 55000,
  'zurich': 52000,
  'geneva': 52000,
  'norway': 45000,
  'oslo': 45000,
  'iceland': 42000,
  'reykjavik': 42000,
  'london': 38000,
  'new york': 38000,
  'san francisco': 36000,
  'paris': 36000,
  'los angeles': 34000,
  'sydney': 34000,
  'melbourne': 32000,
  'dubai': 32000,
  'amsterdam': 32000,
  'stockholm': 38000,
  'copenhagen': 36000,
  'dublin': 35000,
  'abu dhabi': 30000,
  'singapore': 28000,
  'hong kong': 28000,
  'tokyo': 28000,
  'toronto': 28000,
  'vancouver': 26000,

  // ── Premium (₹10,000–₹25,000/day) ──────────────────────────────
  'venice': 24000,
  'santorini': 24000,
  'rome': 22000,
  'milan': 22000,
  'osaka': 22000,
  'kyoto': 22000,
  'munich': 20000,
  'vienna': 20000,
  'florence': 20000,
  'barcelona': 20000,
  'madrid': 18000,
  'berlin': 18000,
  'seoul': 18000,
  'athens': 16000,
  'taipei': 16000,
  'prague': 16000,
  'lisbon': 16000,
  'cape town': 14000,
  'istanbul': 14000,
  'cancun': 14000,
  'budapest': 14000,
  'auckland': 28000,
  'kuala lumpur': 12000,
  'jakarta': 12000,
  'bali': 12000,
  'phuket': 12000,
  'cairo': 12000,
  'mexico city': 12000,
  'marrakech': 11000,
  'ubud': 11000,
  'bangkok': 10000,

  // ── Moderate India (₹4,000–₹10,000/day) ────────────────────────
  'leh': 7000,
  'ladakh': 7000,
  'kashmir': 7000,
  'srinagar': 6500,
  'andaman': 8000,
  'port blair': 8000,
  'goa': 6500,
  'mumbai': 7500,
  'delhi': 6500,
  'new delhi': 6500,
  'bengaluru': 6000,
  'bangalore': 6000,
  'hyderabad': 5500,
  'chennai': 5500,
  'pune': 5500,
  'kerala': 5500,
  'manali': 5500,
  'kolkata': 5000,
  'jaipur': 5500,
  'udaipur': 6000,
  'kochi': 5000,
  'mussoorie': 5000,
  'nainital': 5000,
  'shimla': 5000,
  'lonavala': 5000,
  'coorg': 5000,
  'agra': 5000,
  'chandigarh': 5000,
  'ahmedabad': 5000,
  'rann of kutch': 5000,
  'kutch': 5000,
  'jodhpur': 5000,
  'rajkot': 4000,
  'junagadh': 4000,
  'girnar': 4000,
  'somnath': 4000,
  'dwarka': 4000,
  'varanasi': 4500,
  'dharamshala': 4500,
  'mcleod ganj': 4500,
  'rishikesh': 4500,
  'haridwar': 4000,
  'dehradun': 4500,
  'ooty': 4500,
  'mysuru': 4500,
  'mysore': 4500,
  'darjeeling': 4500,
  'munnar': 5000,
  'amritsar': 4500,
  'puri': 4500,
  'bhubaneswar': 4500,
  'hampi': 4500,
  'surat': 4500,
  'vadodara': 4500,
  'nashik': 4500,
  'aurangabad': 4500,
};

/**
 * Get the estimated daily budget for a destination (in INR).
 * Falls back to sensible defaults based on destination keyword matching.
 */
export function getDestinationDailyBudget(destination: string): number {
  if (!destination) return 6000;
  const lower = destination.toLowerCase().trim();

  for (const [key, val] of Object.entries(DESTINATION_DAILY_BUDGETS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return val;
    }
  }

  // Country-level heuristics
  if (lower.includes('india') || lower.includes('bharat')) return 5500;
  if (lower.includes('europe') || lower.includes('european')) return 20000;
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('america')) return 35000;
  if (lower.includes('uk') || lower.includes('united kingdom') || lower.includes('britain')) return 36000;
  if (lower.includes('japan')) return 22000;
  if (lower.includes('china')) return 12000;
  if (lower.includes('australia')) return 30000;
  if (lower.includes('canada')) return 28000;
  if (lower.includes('africa')) return 10000;
  if (lower.includes('middle east') || lower.includes('gulf')) return 22000;
  if (lower.includes('south east asia') || lower.includes('southeast asia')) return 8000;

  // Generic international fallback
  return 10000;
}

/**
 * Get a full budget estimate with breakdown for a destination + duration.
 */
export function estimateTripBudget(destination: string, durationDays: number): BudgetEstimate {
  const days = Math.max(1, durationDays);
  const perDay = getDestinationDailyBudget(destination);
  const total = Math.round(perDay * days);

  let tier: BudgetEstimate['tier'];
  if (perDay >= 30000) tier = 'Ultra-Luxury';
  else if (perDay >= 15000) tier = 'Premium';
  else if (perDay >= 6000) tier = 'Moderate';
  else tier = 'Budget';

  const breakdown = {
    flightsPerDay: Math.round(perDay * 0.25),
    lodgingPerDay: Math.round(perDay * 0.30),
    foodPerDay: Math.round(perDay * 0.20),
    activitiesPerDay: Math.round(perDay * 0.15),
    transportPerDay: Math.round(perDay * 0.10),
  };

  return { perDay, total, tier, breakdown };
}
