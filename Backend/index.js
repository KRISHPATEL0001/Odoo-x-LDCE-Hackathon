require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma with SQLite driver adapter
// PrismaBetterSqlite3 requires a file: URL string in the url property
const dbPath = path.resolve(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// CORS — allow all origins in dev; set FRONTEND_URL env var in production
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173']
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Helper to format destination output with user-specific wishlist status
function formatDestination(dest, userSavedIds = new Set()) {
  let highlights = [];
  if (Array.isArray(dest.highlights)) {
    highlights = dest.highlights;
  } else if (typeof dest.highlights === 'string' && dest.highlights.startsWith('[')) {
    try {
      highlights = JSON.parse(dest.highlights);
    } catch {
      highlights = dest.highlights.split(',').map((h) => h.trim()).filter(Boolean);
    }
  } else if (typeof dest.highlights === 'string' && dest.highlights) {
    highlights = dest.highlights.split(',').map((h) => h.trim()).filter(Boolean);
  }

  return {
    ...dest,
    highlights,
    isSaved: userSavedIds.has(dest.id),
  };
}

// Known coordinates dictionary for destinations
const KNOWN_GLOBAL_COORDS = {
  'girnar': { lat: 21.5273, lon: 70.5312, country: 'India', flag: '🇮🇳' },
  'girnar hills': { lat: 21.5273, lon: 70.5312, country: 'India', flag: '🇮🇳' },
  'junagadh': { lat: 21.5222, lon: 70.4579, country: 'India', flag: '🇮🇳' },
  'tokyo': { lat: 35.6762, lon: 139.6503, country: 'Japan', flag: '🇯🇵' },
  'paris': { lat: 48.8566, lon: 2.3522, country: 'France', flag: '🇫🇷' },
  'swiss alps': { lat: 46.6863, lon: 7.8632, country: 'Switzerland', flag: '🇨🇭' },
  'interlaken': { lat: 46.6863, lon: 7.8632, country: 'Switzerland', flag: '🇨🇭' },
  'bali': { lat: -8.5069, lon: 115.2625, country: 'Indonesia', flag: '🇮🇩' },
  'manali': { lat: 32.2396, lon: 77.1887, country: 'India', flag: '🇮🇳' },
  'rome': { lat: 41.9028, lon: 12.4964, country: 'Italy', flag: '🇮🇹' },
  'london': { lat: 51.5074, lon: -0.1278, country: 'United Kingdom', flag: '🇬🇧' },
  'dubai': { lat: 25.2048, lon: 55.2708, country: 'United Arab Emirates', flag: '🇦🇪' },
  'new york': { lat: 40.7128, lon: -74.006, country: 'United States', flag: '🇺🇸' },
  'sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia', flag: '🇦🇺' },
  'cairo': { lat: 30.0444, lon: 31.2357, country: 'Egypt', flag: '🇪🇬' },
  'venice': { lat: 45.4408, lon: 12.3155, country: 'Italy', flag: '🇮🇹' },
  'amsterdam': { lat: 52.3676, lon: 4.9041, country: 'Netherlands', flag: '🇳🇱' },
  'santorini': { lat: 36.3932, lon: 25.4615, country: 'Greece', flag: '🇬🇷' },
  'kyoto': { lat: 35.0116, lon: 135.7681, country: 'Japan', flag: '🇯🇵' },
  'singapore': { lat: 1.3521, lon: 103.8198, country: 'Singapore', flag: '🇸🇬' },
  'bangkok': { lat: 13.7563, lon: 100.5018, country: 'Thailand', flag: '🇹🇭' },
  'reykjavik': { lat: 64.1466, lon: -21.9426, country: 'Iceland', flag: '🇮🇸' },
};

function resolveDestinationCoords(destName) {
  if (!destName) return { lat: 21.52, lon: 70.53, flag: '✈️' };
  const lower = String(destName).toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_GLOBAL_COORDS)) {
    if (lower.includes(k) || k.includes(lower)) {
      return v;
    }
  }
  return { lat: 28.6139, lon: 77.209, flag: '🌍' };
}

// Helper to format trip output
function formatTrip(trip) {
  let companions = ['Solo'];
  if (Array.isArray(trip.companions)) {
    companions = trip.companions;
  } else if (typeof trip.companions === 'string' && trip.companions.startsWith('[')) {
    try {
      companions = JSON.parse(trip.companions);
    } catch {
      companions = trip.companions.split(',').map((c) => c.trim()).filter(Boolean);
    }
  } else if (typeof trip.companions === 'string' && trip.companions) {
    companions = trip.companions.split(',').map((c) => c.trim()).filter(Boolean);
  }

  const coords = resolveDestinationCoords(trip.destination);

  return {
    ...trip,
    companions,
    lat: trip.lat || coords.lat,
    lon: trip.lon || coords.lon,
    flag: trip.flag && trip.flag !== '✈️' ? trip.flag : coords.flag || '✈️',
  };
}

// Helper to resolve userId from query, body, or headers
async function resolveUserId(req) {
  const userId = req.query.userId || req.body?.userId || req.headers['x-user-id'];
  if (userId) return String(userId);

  const email = req.query.email || req.body?.email || req.headers['x-user-email'];
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (user) return user.id;
  }
  return null;
}

// --- ROUTES ---

// Health & Status
app.get('/', (req, res) => {
  res.json({
    name: 'GlobeTrotter Backend API',
    database: 'SQLite (Prisma ORM)',
    status: 'connected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const destinationCount = await prisma.destination.count();
    const tripCount = await prisma.trip.count();
    res.json({
      status: 'ok',
      database: 'connected',
      counts: { users: userCount, destinations: destinationCount, trips: tripCount },
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

// --- AUTH / USER ROUTES ---

// 1. Sign Up / Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, avatarUrl, travelStyle } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Full name and email are required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({
        error: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Hash password securely before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        avatarUrl: avatarUrl || null,
        travelStyle: travelStyle || '🎒 Adventure & Trekking',
      },
    });

    const { password: _, ...safeUser } = user;
    res.status(201).json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create account. ' + err.message });
  }
});

// 2. Sign In / Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user doesn't exist, return 401
    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email. Please sign up to create your profile.',
      });
    }

    // Verify password using bcrypt compare (supports both hashed and legacy plain-text)
    if (user.password && password) {
      const isHashed = user.password.startsWith('$2');
      const valid = isHashed
        ? await bcrypt.compare(password, user.password)
        : user.password === password; // fallback for legacy seeded accounts
      if (!valid) {
        return res.status(401).json({
          error: 'Incorrect password. Please verify your credentials and try again.',
        });
      }
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to sign in. ' + err.message });
  }
});

// 3. Get Profile
app.get('/api/auth/profile', async (req, res) => {
  try {
    const { email, id } = req.query;
    let user = null;

    if (id) {
      user = await prisma.user.findUnique({ where: { id: String(id) } });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: String(email).toLowerCase().trim() },
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Profile
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { email, id, name, avatarUrl, bio, homeCity, travelStyle } = req.body;
    let where = null;

    if (id) {
      where = { id: String(id) };
    } else if (email) {
      where = { email: String(email).toLowerCase().trim() };
    }

    if (!where) {
      return res.status(400).json({ error: 'User id or email is required to update profile.' });
    }

    const updated = await prisma.user.update({
      where,
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(homeCity !== undefined ? { homeCity } : {}),
        ...(travelStyle !== undefined ? { travelStyle } : {}),
      },
    });

    const { password: _, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DESTINATIONS ROUTES ---

app.get('/api/destinations', async (req, res) => {
  try {
    const { category, search } = req.query;
    const userId = await resolveUserId(req);

    const where = {};
    if (category && category !== 'all') {
      where.category = String(category);
    }

    let destinations = await prisma.destination.findMany({
      where,
      orderBy: { rating: 'desc' },
    });

    if (search) {
      const q = String(search).toLowerCase();
      destinations = destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          calculateFuzzySimilarity(q, d.name) >= 0.70 ||
          calculateFuzzySimilarity(q, d.country) >= 0.75
      );
    }

    // Get saved destination IDs specifically for this user
    let userSavedIds = new Set();
    if (userId) {
      const savedTrips = await prisma.savedTrip.findMany({
        where: { userId },
        select: { destinationId: true },
      });
      userSavedIds = new Set(savedTrips.map((st) => st.destinationId));
    }

    res.json({
      success: true,
      destinations: destinations.map((d) => formatDestination(d, userSavedIds)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/destinations/:id/save', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req);

    if (!userId) {
      return res.status(400).json({ error: 'User must be signed in to save destinations.' });
    }

    const destination = await prisma.destination.findUnique({ where: { id } });
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    // Check if already saved by this user
    const existing = await prisma.savedTrip.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId: id,
        },
      },
    });

    let isSaved = false;
    if (existing) {
      // Remove from saved
      await prisma.savedTrip.delete({
        where: { id: existing.id },
      });
      isSaved = false;
    } else {
      // Add to saved
      await prisma.savedTrip.create({
        data: {
          userId,
          destinationId: id,
        },
      });
      isSaved = true;
    }

    res.json({
      success: true,
      destination: {
        ...formatDestination(destination),
        isSaved,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TRIPS ROUTES (USER-SCOPED) ---

app.get('/api/trips', async (req, res) => {
  try {
    const { status } = req.query;
    const userId = await resolveUserId(req);

    // Strict user isolation: If user is not provided, return empty array
    if (!userId) {
      return res.json({ success: true, trips: [] });
    }

    const where = { userId };
    if (status) {
      where.status = String(status);
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        activities: true,
        expenses: true,
      },
    });

    res.json({
      success: true,
      trips: trips.map((t) => ({
        ...formatTrip(t),
        activitiesCount: t.activities?.length || t.activitiesCount || 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trips/:id', async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        activities: true,
        expenses: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json({ success: true, trip: formatTrip(trip) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const {
      title,
      destination,
      country,
      flag,
      startDate,
      endDate,
      coverImage,
      budget,
      companions,
      notes,
    } = req.body;

    const userId = await resolveUserId(req);

    if (!title || !destination) {
      return res.status(400).json({ error: 'Title and Destination are required.' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User must be signed in to create a trip.' });
    }

    const companionsStr = Array.isArray(companions)
      ? companions.join(', ')
      : String(companions || 'Solo');

    const newTrip = await prisma.trip.create({
      data: {
        userId,
        title: title.trim(),
        destination: destination.trim(),
        country: country?.trim() || 'Global',
        flag: flag?.trim() || '✈️',
        startDate: startDate || 'May 12, 2025',
        endDate: endDate || 'May 20, 2025',
        startsInDays: 14,
        progressPercent: 20,
        coverImage:
          coverImage ||
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        budget: Number(budget) || 50000,
        spent: 0,
        status: 'upcoming',
        companions: companionsStr,
        notes: notes?.trim() || '',
        activitiesCount: 0,
      },
    });

    res.status(201).json({ success: true, trip: formatTrip(newTrip) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    await prisma.trip.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Trip removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ACTIVITIES / ITINERARY ROUTES ---

app.get('/api/trips/:id/activities', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { tripId: req.params.id },
      orderBy: [{ dayNumber: 'asc' }, { time: 'asc' }],
    });
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips/:id/activities', async (req, res) => {
  try {
    const { title, dayNumber, time, location, category, cost } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Activity title is required.' });
    }

    const activity = await prisma.activity.create({
      data: {
        tripId: req.params.id,
        dayNumber: Number(dayNumber) || 1,
        title: title.trim(),
        time: time || '10:00',
        location: location?.trim() || 'Destination Center',
        category: category || 'Sightseeing',
        cost: Number(cost) || 0,
        completed: false,
      },
    });

    // Update trip activitiesCount
    await prisma.trip.update({
      where: { id: req.params.id },
      data: { activitiesCount: { increment: 1 } },
    });

    res.status(201).json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/activities/:id/toggle', async (req, res) => {
  try {
    const act = await prisma.activity.findUnique({
      where: { id: req.params.id },
    });
    if (!act) {
      return res.status(404).json({ error: 'Activity not found.' });
    }

    const updated = await prisma.activity.update({
      where: { id: req.params.id },
      data: { completed: !act.completed },
    });

    res.json({ success: true, activity: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const act = await prisma.activity.findUnique({
      where: { id: req.params.id },
    });
    if (act) {
      await prisma.activity.delete({ where: { id: req.params.id } });
      await prisma.trip.update({
        where: { id: act.tripId },
        data: { activitiesCount: { decrement: 1 } },
      });
    }
    res.json({ success: true, message: 'Activity removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EXPENSES / BUDGET ROUTES ---

app.get('/api/trips/:id/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { tripId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips/:id/expenses', async (req, res) => {
  try {
    const { category, title, amount, date } = req.body;
    if (!title || amount === undefined) {
      return res.status(400).json({ error: 'Title and amount are required.' });
    }

    const expense = await prisma.expense.create({
      data: {
        tripId: req.params.id,
        category: category || 'Dining',
        title: title.trim(),
        amount: Number(amount) || 0,
        date:
          date ||
          new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      },
    });

    // Update trip spent total
    await prisma.trip.update({
      where: { id: req.params.id },
      data: { spent: { increment: Number(amount) || 0 } },
    });

    res.status(201).json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const exp = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });
    if (exp) {
      await prisma.expense.delete({ where: { id: req.params.id } });
      await prisma.trip.update({
        where: { id: exp.tripId },
        data: { spent: { decrement: exp.amount } },
      });
    }
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- WORLDWIDE PLACES & GEOCODING API ---

const COUNTRY_FLAGS = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', CH: '🇨🇭', ID: '🇮🇩', JP: '🇯🇵',
  AE: '🇦🇪', IT: '🇮🇹', ES: '🇪🇸', DE: '🇩🇪', AU: '🇦🇺', CA: '🇨🇦', BR: '🇧🇷',
  TH: '🇹🇭', EG: '🇪🇬', ZA: '🇿🇦', NL: '🇳🇱', GR: '🇬🇷', SG: '🇸🇬', TR: '🇹🇷',
  IS: '🇮🇸', MX: '🇲🇽', NZ: '🇳🇿', NO: '🇳🇴', SE: '🇸🇪', PT: '🇵🇹', AT: '🇦🇹',
};

function getCountryFlag(code) {
  if (!code) return '🌍';
  const upper = code.toUpperCase();
  if (COUNTRY_FLAGS[upper]) return COUNTRY_FLAGS[upper];
  if (upper.length === 2) {
    try {
      const codePoints = upper.split('').map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '🌍';
    }
  }
  return '🌍';
}
const GLOBAL_DESTINATIONS_FALLBACK = [
  { name: 'Girnar Hills', city: 'Junagadh', country: 'India', countryCode: 'IN', lat: 21.5273, lon: 70.5312, category: 'mountain' },
  { name: 'Junagadh', city: 'Junagadh', country: 'India', countryCode: 'IN', lat: 21.5222, lon: 70.4579, category: 'cultural' },
  { name: 'Manali & Spiti', city: 'Manali', country: 'India', countryCode: 'IN', lat: 32.2396, lon: 77.1887, category: 'mountain' },
  { name: 'Jaipur', city: 'Jaipur', country: 'India', countryCode: 'IN', lat: 26.9124, lon: 75.7873, category: 'cultural' },
  { name: 'Udaipur', city: 'Udaipur', country: 'India', countryCode: 'IN', lat: 24.5854, lon: 73.7125, category: 'cultural' },
  { name: 'Jodhpur', city: 'Jodhpur', country: 'India', countryCode: 'IN', lat: 26.2389, lon: 73.0243, category: 'cultural' },
  { name: 'Jaisalmer', city: 'Jaisalmer', country: 'India', countryCode: 'IN', lat: 26.9157, lon: 70.9083, category: 'cultural' },
  { name: 'Goa', city: 'Panaji', country: 'India', countryCode: 'IN', lat: 15.2993, lon: 74.1240, category: 'beach' },
  { name: 'Varanasi', city: 'Varanasi', country: 'India', countryCode: 'IN', lat: 25.3176, lon: 82.9739, category: 'cultural' },
  { name: 'Agra', city: 'Agra', country: 'India', countryCode: 'IN', lat: 27.1767, lon: 78.0081, category: 'cultural' },
  { name: 'Rishikesh', city: 'Rishikesh', country: 'India', countryCode: 'IN', lat: 30.0869, lon: 78.2676, category: 'mountain' },
  { name: 'Shimla', city: 'Shimla', country: 'India', countryCode: 'IN', lat: 31.1048, lon: 77.1734, category: 'mountain' },
  { name: 'Kerala Backwaters', city: 'Alleppey', country: 'India', countryCode: 'IN', lat: 9.4981, lon: 76.3388, category: 'beach' },
  { name: 'Munnar', city: 'Munnar', country: 'India', countryCode: 'IN', lat: 10.0889, lon: 77.0595, category: 'mountain' },
  { name: 'Amritsar', city: 'Amritsar', country: 'India', countryCode: 'IN', lat: 31.6340, lon: 74.8723, category: 'cultural' },
  { name: 'Somnath & Dwarka', city: 'Somnath', country: 'India', countryCode: 'IN', lat: 20.8880, lon: 70.4013, category: 'cultural' },
  { name: 'Rann of Kutch', city: 'Bhuj', country: 'India', countryCode: 'IN', lat: 23.2420, lon: 69.6669, category: 'cultural' },
  { name: 'Ahmedabad', city: 'Ahmedabad', country: 'India', countryCode: 'IN', lat: 23.0225, lon: 72.5714, category: 'city' },
  { name: 'Mumbai', city: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0760, lon: 72.8777, category: 'city' },
  { name: 'New Delhi', city: 'New Delhi', country: 'India', countryCode: 'IN', lat: 28.6139, lon: 77.2090, category: 'city' },
  { name: 'Tokyo', city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503, category: 'city' },
  { name: 'Kyoto', city: 'Kyoto', country: 'Japan', countryCode: 'JP', lat: 35.0116, lon: 135.7681, category: 'cultural' },
  { name: 'Paris', city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522, category: 'cultural' },
  { name: 'Swiss Alps', city: 'Interlaken', country: 'Switzerland', countryCode: 'CH', lat: 46.6863, lon: 7.8632, category: 'mountain' },
  { name: 'Interlaken', city: 'Interlaken', country: 'Switzerland', countryCode: 'CH', lat: 46.6863, lon: 7.8632, category: 'mountain' },
  { name: 'Zermatt', city: 'Zermatt', country: 'Switzerland', countryCode: 'CH', lat: 45.9765, lon: 7.7491, category: 'mountain' },
  { name: 'Bali', city: 'Ubud', country: 'Indonesia', countryCode: 'ID', lat: -8.5069, lon: 115.2625, category: 'beach' },
  { name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lon: 55.2708, category: 'city' },
  { name: 'Rome', city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lon: 12.4964, category: 'cultural' },
  { name: 'Amalfi Coast', city: 'Positano', country: 'Italy', countryCode: 'IT', lat: 40.6281, lon: 14.4850, category: 'beach' },
  { name: 'Venice', city: 'Venice', country: 'Italy', countryCode: 'IT', lat: 45.4408, lon: 12.3155, category: 'cultural' },
  { name: 'Florence', city: 'Florence', country: 'Italy', countryCode: 'IT', lat: 43.7696, lon: 11.2558, category: 'cultural' },
  { name: 'London', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, category: 'city' },
  { name: 'New York', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.0060, category: 'city' },
  { name: 'Banff National Park', city: 'Banff', country: 'Canada', countryCode: 'CA', lat: 51.1784, lon: -115.5708, category: 'mountain' },
  { name: 'Sydney', city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093, category: 'beach' },
  { name: 'Cairo', city: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0444, lon: 31.2357, category: 'cultural' },
  { name: 'Reykjavik', city: 'Reykjavik', country: 'Iceland', countryCode: 'IS', lat: 64.1466, lon: -21.9426, category: 'mountain' },
  { name: 'Santorini', city: 'Thira', country: 'Greece', countryCode: 'GR', lat: 36.3932, lon: 25.4615, category: 'beach' },
  { name: 'Barcelona', city: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.3879, lon: 2.1699, category: 'cultural' },
  { name: 'Cape Town', city: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.9249, lon: 18.4241, category: 'mountain' },
  { name: 'Rio de Janeiro', city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', lat: -22.9068, lon: -43.1729, category: 'beach' },
  { name: 'Singapore', city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, category: 'city' },
  { name: 'Bangkok', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lon: 100.5018, category: 'cultural' },
  { name: 'Phuket', city: 'Phuket', country: 'Thailand', countryCode: 'TH', lat: 7.8804, lon: 98.3923, category: 'beach' },
  { name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lon: 4.9041, category: 'cultural' },
];

// --- FUZZY LOCATION PREDICTION ALGORITHM ---

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );

      // Damerau transposition check
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}

function calculateFuzzySimilarity(query, target) {
  const q = String(query || '').toLowerCase().trim();
  const t = String(target || '').toLowerCase().trim();

  if (!q || !t) return 0;
  if (q === t) return 1.0;
  if (t.includes(q) || q.includes(t)) return 0.94;

  // Word level check
  const qWords = q.split(/\s+/);
  const tWords = t.split(/\s+/);
  for (const qw of qWords) {
    for (const tw of tWords) {
      if (qw === tw) return 0.92;
      if (tw.startsWith(qw)) return 0.88;
      const dist = levenshteinDistance(qw, tw);
      const maxLen = Math.max(qw.length, tw.length);
      const ratio = 1 - dist / maxLen;
      if (dist <= 1 && maxLen >= 3) return Math.max(0.85, ratio);
      if (dist <= 2 && maxLen >= 5) return Math.max(0.78, ratio);
    }
  }

  const dist = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  return Math.max(0, 1 - dist / maxLen);
}

function predictDestination(query, candidates) {
  const q = String(query || '').toLowerCase().trim();
  if (q.length < 2) return null;

  let best = null;
  let highestScore = 0;

  for (const item of candidates) {
    const nameScore = calculateFuzzySimilarity(q, item.name);
    const cityScore = item.city ? calculateFuzzySimilarity(q, item.city) : 0;
    const maxScore = Math.max(nameScore, cityScore);

    if (maxScore > highestScore) {
      highestScore = maxScore;
      best = { ...item, predictionConfidence: maxScore };
    }
  }

  if (highestScore >= 0.70) {
    return best;
  }
  return null;
}

// Famous Global Tourist Destinations & Weights for Search Disambiguation
const FAMOUS_TOURIST_HUBS = [
  { name: 'girnar', country: 'india', state: 'gujarat', boost: 2200, label: 'Girnar Hills, Gujarat, India' },
  { name: 'junagadh', country: 'india', state: 'gujarat', boost: 2000, label: 'Junagadh, Gujarat, India' },
  { name: 'paris', country: 'france', boost: 2000, label: 'Paris, France (City of Light)' },
  { name: 'london', country: 'united kingdom', boost: 2000, label: 'London, UK' },
  { name: 'tokyo', country: 'japan', boost: 2000, label: 'Tokyo, Japan' },
  { name: 'rome', country: 'italy', boost: 2000, label: 'Rome, Italy (Eternal City)' },
  { name: 'bali', country: 'indonesia', boost: 2000, label: 'Bali, Indonesia (Island of the Gods)' },
  { name: 'swiss alps', country: 'switzerland', boost: 2000, label: 'Swiss Alps, Switzerland' },
  { name: 'interlaken', country: 'switzerland', boost: 1800, label: 'Interlaken, Switzerland' },
  { name: 'zermatt', country: 'switzerland', boost: 1800, label: 'Zermatt, Switzerland' },
  { name: 'manali', country: 'india', state: 'himachal pradesh', boost: 2000, label: 'Manali, Himachal Pradesh, India' },
  { name: 'goa', country: 'india', boost: 1800, label: 'Goa, India' },
  { name: 'agra', country: 'india', boost: 1800, label: 'Agra, India (Taj Mahal)' },
  { name: 'jaipur', country: 'india', state: 'rajasthan', boost: 1900, label: 'Jaipur, Rajasthan, India (Pink City)' },
  { name: 'udaipur', country: 'india', state: 'rajasthan', boost: 1900, label: 'Udaipur, Rajasthan, India (City of Lakes)' },
  { name: 'jodhpur', country: 'india', state: 'rajasthan', boost: 1800, label: 'Jodhpur, Rajasthan, India (Blue City)' },
  { name: 'varanasi', country: 'india', state: 'uttar pradesh', boost: 1900, label: 'Varanasi, India' },
  { name: 'rishikesh', country: 'india', state: 'uttarakhand', boost: 1800, label: 'Rishikesh, Uttarakhand, India' },
  { name: 'dubai', country: 'united arab emirates', boost: 2000, label: 'Dubai, UAE' },
  { name: 'new york', country: 'united states', boost: 2000, label: 'New York City, USA' },
  { name: 'sydney', country: 'australia', boost: 2000, label: 'Sydney, Australia' },
  { name: 'cairo', country: 'egypt', boost: 2000, label: 'Cairo, Egypt (Pyramids of Giza)' },
  { name: 'venice', country: 'italy', boost: 2000, label: 'Venice, Italy (City of Canals)' },
  { name: 'amalfi coast', country: 'italy', boost: 2000, label: 'Amalfi Coast, Italy' },
  { name: 'barcelona', country: 'spain', boost: 2000, label: 'Barcelona, Spain' },
  { name: 'amsterdam', country: 'netherlands', boost: 2000, label: 'Amsterdam, Netherlands' },
  { name: 'santorini', country: 'greece', boost: 2000, label: 'Santorini, Greece' },
  { name: 'athens', country: 'greece', boost: 2000, label: 'Athens, Greece' },
  { name: 'kyoto', country: 'japan', boost: 1900, label: 'Kyoto, Japan' },
  { name: 'singapore', country: 'singapore', boost: 1900, label: 'Singapore' },
  { name: 'bangkok', country: 'thailand', boost: 1900, label: 'Bangkok, Thailand' },
  { name: 'phuket', country: 'thailand', boost: 1800, label: 'Phuket, Thailand' },
  { name: 'reykjavik', country: 'iceland', boost: 1800, label: 'Reykjavik, Iceland' },
  { name: 'cape town', country: 'south africa', boost: 1800, label: 'Cape Town, South Africa' },
  { name: 'rio de janeiro', country: 'brazil', boost: 1800, label: 'Rio de Janeiro, Brazil' },
  { name: 'prague', country: 'czech republic', boost: 1800, label: 'Prague, Czech Republic' },
  { name: 'vienna', country: 'austria', boost: 1800, label: 'Vienna, Austria' },
  { name: 'florence', country: 'italy', boost: 1800, label: 'Florence, Italy' },
  { name: 'vancouver', country: 'canada', boost: 1700, label: 'Vancouver, Canada' },
  { name: 'banff', country: 'canada', boost: 1800, label: 'Banff National Park, Canada' },
];

function calculateTouristRankingScore(item, queryLower) {
  let score = item.importance ? item.importance * 100 : 50;

  const nameLower = String(item.name || '').toLowerCase();
  const countryLower = String(item.country || '').toLowerCase();
  const displayLower = String(item.displayName || '').toLowerCase();

  // 1. Exact or Fuzzy query match boost
  const fuzzySim = calculateFuzzySimilarity(queryLower, nameLower);
  if (nameLower === queryLower) {
    score += 400;
  } else if (nameLower.startsWith(queryLower)) {
    score += 200;
  } else if (fuzzySim >= 0.75) {
    score += Math.round(fuzzySim * 250);
  }

  // 2. Check famous tourist hub directory
  for (const hub of FAMOUS_TOURIST_HUBS) {
    const hubMatches =
      nameLower.includes(hub.name) ||
      hub.name.includes(nameLower) ||
      queryLower.includes(hub.name) ||
      hub.name.includes(queryLower) ||
      calculateFuzzySimilarity(queryLower, hub.name) >= 0.75;

    const countryMatches = countryLower.includes(hub.country) || hub.country.includes(countryLower);

    if (hubMatches && countryMatches) {
      if (hub.state) {
        if (displayLower.includes(hub.state.toLowerCase())) {
          score += hub.boost + 200;
          item.isTopTouristSpot = true;
          item.rankingBadge = '⭐ Top Global Tourist Destination';
        }
      } else {
        score += hub.boost;
        item.isTopTouristSpot = true;
        item.rankingBadge = '⭐ Top Global Tourist Destination';
      }
      break;
    }
  }

  // 3. Administrative / City status boost over small hamlets
  const type = String(item.type || '').toLowerCase();
  if (type === 'city' || type === 'administrative' || type === 'capital') {
    score += 250;
  } else if (type === 'town') {
    score += 100;
  } else if (type === 'village' || type === 'hamlet' || type === 'suburb') {
    score -= 150;
  }

  // 4. Tourism / Attraction type boost
  const category = String(item.category || '').toLowerCase();
  if (category === 'tourism' || category === 'historic' || category === 'attraction' || category === 'boundary') {
    score += 150;
  }

  return score;
}

app.get('/api/places/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) {
      return res.json({
        success: true,
        places: GLOBAL_DESTINATIONS_FALLBACK.slice(0, 8).map((d, idx) => ({
          id: `place-${idx}`,
          name: d.name,
          displayName: `${d.name}, ${d.country}`,
          city: d.city,
          country: d.country,
          countryCode: d.countryCode,
          flag: getCountryFlag(d.countryCode),
          lat: d.lat,
          lon: d.lon,
          category: d.category,
          isTopTouristSpot: true,
          rankingBadge: '⭐ Top Global Tourist Destination',
        })),
      });
    }

    const query = String(q).trim();
    const queryLower = query.toLowerCase();

    // 1. Check Fuzzy Prediction against Global Tourist Destinations
    const predictedDestination = predictDestination(queryLower, GLOBAL_DESTINATIONS_FALLBACK);

    let places = [];
    const searchQueriesToTry = [query];
    if (predictedDestination && predictedDestination.name.toLowerCase() !== queryLower) {
      searchQueriesToTry.push(predictedDestination.name);
    }

    // Try OpenStreetMap Nominatim Worldwide Geocoding
    for (const searchQ of searchQueriesToTry) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQ
        )}&limit=8&addressdetails=1`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'GlobeTrotter-Travel-App/2.0 (travel@globetrotter.io)',
            'Accept-Language': 'en',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const parsed = data.map((item, idx) => {
              const addr = item.address || {};
              const city =
                addr.city || addr.town || addr.village || addr.state || item.name;
              const country = addr.country || 'Global';
              const countryCode = addr.country_code ? addr.country_code.toUpperCase() : 'GL';

              const isAutoCorrection = searchQ !== query;
              const placeObj = {
                id: item.place_id ? `osm-${item.place_id}` : `place-${idx}`,
                name: item.name || city,
                displayName: item.display_name,
                city,
                country,
                countryCode,
                flag: getCountryFlag(countryCode),
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type,
                category: item.category || 'destination',
                importance: item.importance || 0.4,
                isTopTouristSpot: false,
                rankingBadge: isAutoCorrection ? `✨ Predicted from "${query}"` : '',
                isAutoPredicted: isAutoCorrection,
              };

              placeObj.score = calculateTouristRankingScore(placeObj, queryLower) + (isAutoCorrection ? 200 : 0);
              return placeObj;
            });
            places.push(...parsed);
          }
        }
      } catch (e) {
        console.warn('External geocoding network error:', e.message);
      }

      // If primary query succeeded, don't need additional fallback query
      if (places.length >= 4) break;
    }

    // 2. Add matching or predicted fallback tourist hubs
    const matchedFallbacks = GLOBAL_DESTINATIONS_FALLBACK.map((d, idx) => {
      const sim = calculateFuzzySimilarity(queryLower, d.name);
      const citySim = calculateFuzzySimilarity(queryLower, d.city);
      const bestSim = Math.max(sim, citySim);
      return { d, idx, bestSim };
    })
      .filter(({ bestSim }) => bestSim >= 0.65)
      .map(({ d, idx, bestSim }) => {
        const isPredicted = !d.name.toLowerCase().includes(queryLower) && bestSim >= 0.70;
        const fbObj = {
          id: `place-fallback-${idx}`,
          name: d.name,
          displayName: `${d.name}, ${d.country}`,
          city: d.city,
          country: d.country,
          countryCode: d.countryCode,
          flag: getCountryFlag(d.countryCode),
          lat: d.lat,
          lon: d.lon,
          category: d.category,
          importance: 0.95,
          isTopTouristSpot: true,
          rankingBadge: isPredicted
            ? `✨ Predicted from "${query}"`
            : '⭐ Top Global Tourist Destination',
          isAutoPredicted: isPredicted,
        };
        fbObj.score = calculateTouristRankingScore(fbObj, queryLower) + Math.round(bestSim * 800);
        return fbObj;
      });

    // Combine external places and fallback items, deduplicate by coordinates/name
    const allCandidates = [...matchedFallbacks, ...places];
    const seen = new Set();
    const unique = [];

    for (const p of allCandidates) {
      const key = `${p.name.toLowerCase()}-${p.country.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    }

    // Sort by Tourist Popularity & Importance Score in strictly descending order
    unique.sort((a, b) => (b.score || 0) - (a.score || 0));

    res.json({
      success: true,
      predictedQuery: predictedDestination ? predictedDestination.name : null,
      places: unique.slice(0, 6),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- WORLDWIDE WEATHER API (Open-Meteo) ---

const WEATHER_CODE_MAP = {
  0: { label: 'Clear Sky', icon: 'Sun', emoji: '☀️' },
  1: { label: 'Mainly Clear', icon: 'Sun', emoji: '🌤️' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', emoji: '⛅' },
  3: { label: 'Overcast', icon: 'Cloud', emoji: '☁️' },
  45: { label: 'Foggy', icon: 'CloudFog', emoji: '🌫️' },
  48: { label: 'Depositing Rime Fog', icon: 'CloudFog', emoji: '🌫️' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', emoji: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', emoji: '🌦️' },
  55: { label: 'Dense Drizzle', icon: 'CloudRain', emoji: '🌧️' },
  61: { label: 'Slight Rain', icon: 'CloudRain', emoji: '🌧️' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', emoji: '🌧️' },
  65: { label: 'Heavy Rain', icon: 'CloudRain', emoji: '🌧️' },
  71: { label: 'Slight Snow', icon: 'Snowflake', emoji: '🌨️' },
  73: { label: 'Moderate Snow', icon: 'Snowflake', emoji: '❄️' },
  75: { label: 'Heavy Snow', icon: 'Snowflake', emoji: '❄️' },
  80: { label: 'Rain Showers', icon: 'CloudRain', emoji: '🌧️' },
  81: { label: 'Moderate Showers', icon: 'CloudRain', emoji: '🌧️' },
  82: { label: 'Violent Showers', icon: 'CloudLightning', emoji: '⛈️' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', emoji: '⛈️' },
  96: { label: 'Thunderstorm with Hail', icon: 'CloudLightning', emoji: '⛈️' },
};

function parseWeatherCode(code) {
  return WEATHER_CODE_MAP[code] || { label: 'Pleasant', icon: 'Sun', emoji: '☀️' };
}

app.get('/api/weather', async (req, res) => {
  try {
    let { lat, lon, city } = req.query;

    // Default fallback: Interlaken / Swiss Alps
    let latitude = parseFloat(lat) || 46.6863;
    let longitude = parseFloat(lon) || 7.8632;
    let locationName = city || 'Destination';

    if ((!lat || !lon) && city) {
      const match = GLOBAL_DESTINATIONS_FALLBACK.find((d) =>
        d.name.toLowerCase().includes(String(city).toLowerCase())
      );
      if (match) {
        latitude = match.lat;
        longitude = match.lon;
        locationName = match.name;
      }
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const curr = data.current || {};
    const daily = data.daily || {};
    const codeInfo = parseWeatherCode(curr.weather_code);

    const forecast = (daily.time || []).slice(0, 5).map((dateStr, idx) => {
      const code = daily.weather_code?.[idx] ?? 0;
      const dayCodeInfo = parseWeatherCode(code);
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        date: dateStr,
        dayName,
        maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 24),
        minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 16),
        condition: dayCodeInfo.label,
        emoji: dayCodeInfo.emoji,
        icon: dayCodeInfo.icon,
      };
    });

    res.json({
      success: true,
      weather: {
        location: locationName,
        lat: latitude,
        lon: longitude,
        temperature: Math.round(curr.temperature_2m ?? 22),
        feelsLike: Math.round(curr.apparent_temperature ?? 22),
        humidity: Math.round(curr.relative_humidity_2m ?? 50),
        windSpeed: Math.round(curr.wind_speed_10m ?? 12),
        precipitation: curr.precipitation ?? 0,
        condition: codeInfo.label,
        emoji: codeInfo.emoji,
        icon: codeInfo.icon,
        forecast,
        packingTip:
          curr.temperature_2m < 12
            ? '🧥 Pack a warm thermal jacket, gloves, and layer up.'
            : curr.temperature_2m > 28
            ? '🕶️ Pack breathable cotton wear, sunglasses, and high-SPF sunscreen.'
            : '👟 Pack comfortable walking shoes, a light fleece, and casual layers.',
      },
    });
  } catch (err) {
    // Return friendly offline/simulated forecast if service is temporarily unreachable
    res.json({
      success: true,
      weather: {
        location: req.query.city || 'Global Escape',
        lat: 46.68,
        lon: 7.86,
        temperature: 21,
        feelsLike: 20,
        humidity: 55,
        windSpeed: 10,
        precipitation: 0,
        condition: 'Clear Sky',
        emoji: '☀️',
        icon: 'Sun',
        forecast: [
          { dayName: 'Mon', maxTemp: 23, minTemp: 14, condition: 'Sunny', emoji: '☀️', icon: 'Sun' },
          { dayName: 'Tue', maxTemp: 24, minTemp: 15, condition: 'Partly Cloudy', emoji: '⛅', icon: 'CloudSun' },
          { dayName: 'Wed', maxTemp: 22, minTemp: 13, condition: 'Light Rain', emoji: '🌧️', icon: 'CloudRain' },
          { dayName: 'Thu', maxTemp: 25, minTemp: 16, condition: 'Clear Sky', emoji: '☀️', icon: 'Sun' },
          { dayName: 'Fri', maxTemp: 26, minTemp: 17, condition: 'Sunny', emoji: '☀️', icon: 'Sun' },
        ],
        packingTip: '👟 Pack comfortable walking shoes, a light jacket, and sunscreen.',
      },
    });
  }
});

// --- LIVE CURRENCY EXCHANGE RATES API ---

const BASE_RATES_TO_INR = {
  INR: 1,
  USD: 86.5,
  EUR: 90.2,
  GBP: 108.4,
  JPY: 0.58,
  AED: 23.55,
  AUD: 55.8,
  CAD: 61.2,
  CHF: 96.8,
};

app.get('/api/currency/rates', (req, res) => {
  res.json({
    success: true,
    base: 'INR',
    rates: BASE_RATES_TO_INR,
    symbols: {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AED: 'د.إ',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'CHF',
    },
    timestamp: new Date().toISOString(),
  });
});

// --- AI TRAVEL ASSISTANT & INTELLIGENCE ENGINE ---

const GLOBAL_CITY_INTELLIGENCE = {
  tokyo: {
    country: 'Japan',
    flag: '🇯🇵',
    lat: 35.6762,
    lon: 139.6503,
    transit: [
      { mode: 'Flight', title: 'Direct International Flight to HND/NRT', duration: '8h 30m', cost: 42000, provider: 'ANA / Japan Airlines / Air India', frequency: 'Daily (3 flights)' },
      { mode: 'Train', title: 'JR Shinkansen Bullet Train Network', duration: '2h 15m from Osaka', cost: 8500, provider: 'JR East', frequency: 'Every 15 mins' },
      { mode: 'Transit Pass', title: 'Tokyo Subway 72-Hour Unlimited Pass', duration: '3 Days', cost: 950, provider: 'Tokyo Metro', frequency: 'Unlimited' },
    ],
    places: [
      { name: 'Senso-ji Temple & Asakusa', category: 'Cultural', rating: 4.9, time: 'Morning (08:00 - 11:00)', description: 'Tokyo’s oldest Buddhist temple with historic Nakamise shopping street.', tip: 'Visit before 9 AM for peaceful photos without crowd.' },
      { name: 'Shibuya Crossing & Shibuya Sky', category: 'Modern', rating: 4.95, time: 'Sunset (17:30 - 20:00)', description: 'The world’s busiest scramble crossing and 360-degree rooftop deck.', tip: 'Book Shibuya Sky tickets 2 weeks in advance for golden hour.' },
      { name: 'TeamLab Planets Digital Art', category: 'Adventure', rating: 4.92, time: 'Afternoon (14:00 - 16:30)', description: 'Immersive body-interactive digital art museum walking through water.', tip: 'Wear pants you can roll up above your knees.' },
      { name: 'Meiji Jingu Shrine & Harajuku', category: 'Nature', rating: 4.88, time: 'Morning (09:00 - 12:00)', description: 'Tranquil forested Shinto shrine adjacent to vibrant Takeshita Street.', tip: 'Taste freshly made crepe rolls in Harajuku.' },
    ],
    hotels: [
      { name: 'Aman Tokyo', tier: 'Luxury', rating: 4.96, pricePerNight: 75000, area: 'Otemachi', amenities: ['Panoramic Spa', 'Infinity Pool', 'Michelin Dining'] },
      { name: 'Hotel Gracery Shinjuku (Godzilla)', tier: 'Boutique', rating: 4.85, pricePerNight: 14000, area: 'Shinjuku', amenities: ['City Views', 'Subway Access', 'Godzilla Terrace'] },
      { name: 'Candeo Hotels Tokyo Shimbashi', tier: 'Comfort', rating: 4.82, pricePerNight: 9500, area: 'Shimbashi', amenities: ['Sky Spa', 'Open-air Bath', 'Free High-speed WiFi'] },
      { name: 'Nui. Hostel & Bar Lounge', tier: 'Budget', rating: 4.78, pricePerNight: 3500, area: 'Kuramae', amenities: ['Craft Cafe', 'Co-working', 'Rooftop River View'] },
    ],
    restaurants: [
      { name: 'Sukiyabashi Jiro / Sushi Dai', cuisine: 'Authentic Edomae Sushi', rating: 4.95, priceLevel: '$$$$', mustTry: 'Omakase Nigiri Set', neighborhood: 'Ginza / Toyosu' },
      { name: 'Ichiran Shinjuku Chuo', cuisine: 'Tonkotsu Ramen', rating: 4.9, priceLevel: '$$', mustTry: 'Spicy Tonkotsu with Soft Boiled Egg', neighborhood: 'Shinjuku' },
      { name: 'Gyukatsu Motomura', cuisine: 'Crispy Deep-fried Beef Cutlet', rating: 4.92, priceLevel: '$$', mustTry: 'Stone-grilled Wagyu Cutlet Set', neighborhood: 'Shibuya' },
      { name: 'Tsukiji Outer Market Food Stalls', cuisine: 'Street Food & Fresh Seafood', rating: 4.86, priceLevel: '$', mustTry: 'Tamagoyaki & Grilled Scallops', neighborhood: 'Tsukiji' },
    ],
    reviews: [
      { author: 'Elena Rostova', location: 'London, UK', rating: 5, date: '2 days ago', text: 'Tokyo is the most organized, clean, and futuristic city I have ever explored. Getting a Suica card was a lifesaver for metro transit!', verified: true },
      { author: 'Marcus Sterling', location: 'Sydney, Australia', rating: 5, date: '1 week ago', text: 'Food is Michelin level even in tiny alleyways. Make sure you carry cash as some traditional ramen shops only take yen notes.', verified: true },
      { author: 'Ananya Deshmukh', location: 'Mumbai, India', rating: 5, date: '2 weeks ago', text: 'Shibuya Sky at sunset was magical. Friendly locals and super safe for solo female travelers at any hour of the night.', verified: true },
    ],
    safetyScore: 9.8,
    currency: 'JPY (¥)',
    plugType: 'Type A / B (100V)',
  },
  paris: {
    country: 'France',
    flag: '🇫🇷',
    lat: 48.8566,
    lon: 2.3522,
    transit: [
      { mode: 'Flight', title: 'Direct Flight to Charles de Gaulle (CDG)', duration: '9h 15m', cost: 48000, provider: 'Air France / Emirates', frequency: 'Daily (4 flights)' },
      { mode: 'Train', title: 'Eurostar & TGV High-Speed Rail', duration: '2h 16m from London', cost: 7200, provider: 'SNCF / Eurostar', frequency: 'Hourly' },
      { mode: 'Metro Pass', title: 'Navigo Easy Metro Pass', duration: 'Weekly', cost: 1800, provider: 'RATP', frequency: 'Unlimited' },
    ],
    places: [
      { name: 'Eiffel Tower & Champ de Mars', category: 'Iconic', rating: 4.92, time: 'Twilight (19:00 - 22:00)', description: 'The timeless iron symbol of Paris with sparkling light show at night.', tip: 'Book summit elevator tickets online 60 days in advance.' },
      { name: 'Louvre Museum & Tuileries Garden', category: 'Cultural', rating: 4.9, time: 'Morning (09:00 - 13:00)', description: 'World’s largest art museum housing the Mona Lisa and Winged Victory.', tip: 'Enter via Carrousel du Louvre underground mall to skip main pyramid queues.' },
      { name: 'Montmartre & Sacré-Cœur Basilica', category: 'Romantic', rating: 4.88, time: 'Sunset (17:00 - 20:00)', description: 'Bohemian hilltop village with panoramic views of the Parisian skyline.', tip: 'Sit on the basilica steps to listen to local acoustic street musicians.' },
    ],
    hotels: [
      { name: 'Le Meurice – Dorchester Collection', tier: 'Luxury', rating: 4.97, pricePerNight: 95000, area: '1st Arrondissement', amenities: ['Palace Spa', 'Tuileries Views', 'Alain Ducasse Dining'] },
      { name: 'Hotel des Grands Boulevards', tier: 'Boutique', rating: 4.88, pricePerNight: 22000, area: '2nd Arrondissement', amenities: ['Rooftop Cocktail Bar', 'French Courtyard', 'Bespoke Beds'] },
      { name: 'CitizenM Paris Gare de Lyon', tier: 'Comfort', rating: 4.82, pricePerNight: 12500, area: '12th Arrondissement', amenities: ['Smart Control Rooms', 'Skyline Bar', '24/7 Grab & Go'] },
      { name: 'Generator Paris', tier: 'Budget', rating: 4.75, pricePerNight: 4200, area: '10th Arrondissement', amenities: ['Canal Saint-Martin', 'Rooftop DJ', 'Chic Cafe'] },
    ],
    restaurants: [
      { name: 'Le Comptoir du Relais', cuisine: 'Classic French Bistro', rating: 4.9, priceLevel: '$$$', mustTry: 'Duck Confit & Escargots', neighborhood: 'Saint-Germain' },
      { name: 'Du Pain et des Idées', cuisine: 'Artisan French Bakery', rating: 4.94, priceLevel: '$', mustTry: 'Escargot Pistache Chocolat & Croissants', neighborhood: 'Canal Saint-Martin' },
      { name: 'L’As du Fallafel', cuisine: 'Middle Eastern Street Food', rating: 4.89, priceLevel: '$', mustTry: 'Special Pita Falafel with Roasted Eggplant', neighborhood: 'Le Marais' },
    ],
    reviews: [
      { author: 'Claire Dupont', location: 'Toronto, Canada', rating: 5, date: '3 days ago', text: 'Wandering through Le Marais with a warm croissant in hand was pure bliss. Highly recommend walking everywhere!', verified: true },
      { author: 'Rahul Singhania', location: 'Bengaluru, India', rating: 5, date: '1 week ago', text: 'The Seine river sunset cruise at twilight was unforgettable. Paris metro is very easy to navigate with Google maps.', verified: true },
    ],
    safetyScore: 9.2,
    currency: 'EUR (€)',
    plugType: 'Type C / E (230V)',
  },
  'swiss alps': {
    country: 'Switzerland',
    flag: '🇨🇭',
    lat: 46.6863,
    lon: 7.8632,
    transit: [
      { mode: 'Flight', title: 'Fly to Zurich (ZRH) or Geneva (GVA)', duration: '8h 45m', cost: 45000, provider: 'Swiss International Air Lines', frequency: 'Daily' },
      { mode: 'Panoramic Train', title: 'Swiss GoldenPass & Glacier Express', duration: '2h from Zurich', cost: 5800, provider: 'SBB / CFF / FFS', frequency: 'Hourly' },
      { mode: 'All-in-One Pass', title: 'Swiss Travel Pass (Unlimited Trains, Boats & Cable Cars)', duration: '4-8 Days', cost: 24000, provider: 'Swiss Rail', frequency: 'Unlimited' },
    ],
    places: [
      { name: 'Jungfraujoch – Top of Europe', category: 'Adventure', rating: 4.96, time: 'Full Day (08:30 - 15:30)', description: 'Europe’s highest railway station at 3,454m with Aletsch Glacier views.', tip: 'Check live webcams at Interlaken before purchasing summit pass.' },
      { name: 'Lauterbrunnen Valley of 72 Waterfalls', category: 'Nature', rating: 4.94, time: 'Morning (09:00 - 13:00)', description: 'Dramatic cliffside valley inspiration for Tolkien’s Rivendell.', tip: 'Rent an e-bike to cruise all the way to Stechelberg.' },
      { name: 'Lake Brienz & Lake Thun Cruises', category: 'Relaxation', rating: 4.89, time: 'Afternoon (14:00 - 17:00)', description: 'Turquoise glacial waters surrounded by snowcapped alpine peaks.', tip: 'Free boat rides are included with the Swiss Travel Pass!' },
    ],
    hotels: [
      { name: 'Victoria-Jungfrau Grand Hotel & Spa', tier: 'Luxury', rating: 4.96, pricePerNight: 68000, area: 'Interlaken', amenities: ['5,500m² Alpine Spa', 'Jungfrau Mountain View', 'Fine Dining'] },
      { name: 'Hotel Staubbach', tier: 'Boutique', rating: 4.88, pricePerNight: 18000, area: 'Lauterbrunnen', amenities: ['Waterfall View Balconies', 'Swiss Breakfast', 'Lounge'] },
      { name: 'The Hey Hotel Interlaken', tier: 'Comfort', rating: 4.82, pricePerNight: 13500, area: 'Interlaken West', amenities: ['Modern Design', 'Activity Concierge', 'Outdoor Terrace'] },
      { name: 'Balmers Hostel & Tents', tier: 'Budget', rating: 4.76, pricePerNight: 4500, area: 'Interlaken Matten', amenities: ['Hot Tub Garden', 'Hammocks', 'Adventure Booking'] },
    ],
    restaurants: [
      { name: 'Restaurant Laterne', cuisine: 'Traditional Swiss Fondue', rating: 4.91, priceLevel: '$$$', mustTry: 'Half-and-Half Gruyère Cheese Fondue & Röstis', neighborhood: 'Interlaken' },
      { name: 'Airtime Cafe Lauterbrunnen', cuisine: 'Organic Alpine Cafe', rating: 4.88, priceLevel: '$$', mustTry: 'Artisan Espresso, Carrot Cake & Warm Paninis', neighborhood: 'Lauterbrunnen' },
      { name: 'Crystal Restaurant Jungfraujoch', cuisine: 'High Altitude Dining', rating: 4.85, priceLevel: '$$$$', mustTry: 'Swiss Veal Ragout with Crisp Röstis', neighborhood: 'Jungfraujoch Summit' },
    ],
    reviews: [
      { author: 'Vikram Malhotra', location: 'New Delhi, India', rating: 5, date: '4 days ago', text: 'Words cannot describe the sheer beauty of Lauterbrunnen. The Swiss Travel Pass saved us thousands of francs!', verified: true },
      { author: 'Samantha Miller', location: 'Chicago, USA', rating: 5, date: '1 week ago', text: 'Clean air, punctual trains down to the exact second, and friendly people. Bring sturdy hiking shoes!', verified: true },
    ],
    safetyScore: 9.9,
    currency: 'CHF (Swiss Franc)',
    plugType: 'Type J (230V)',
  },
  bali: {
    country: 'Indonesia',
    flag: '🇮🇩',
    lat: -8.5069,
    lon: 115.2625,
    transit: [
      { mode: 'Flight', title: 'Direct / 1-Stop Flight to Denpasar (DPS)', duration: '7h 15m', cost: 28000, provider: 'Garuda Indonesia / Singapore Airlines / AirAsia', frequency: 'Daily (6 flights)' },
      { mode: 'Private Driver', title: 'Full-Day Private Chauffeur & Air-Con SUV', duration: '10 Hours', cost: 2800, provider: 'Local Tour Drivers', frequency: 'On-demand' },
      { mode: 'Scooter Rental', title: 'Automatic 125cc Scooter with Helmets', duration: 'Daily', cost: 450, provider: 'Ubud / Canggu Rentals', frequency: 'Instant' },
    ],
    places: [
      { name: 'Tegallalang Rice Terraces & Jungle Swing', category: 'Nature', rating: 4.9, time: 'Sunrise (06:30 - 09:30)', description: 'Cascading emerald green rice paddies with giant jungle swings.', tip: 'Arrive by 7:00 AM to see the morning sun rays filtering through palm trees.' },
      { name: 'Mount Batur Sunrise Jeep Trek', category: 'Adventure', rating: 4.95, time: 'Early Dawn (04:00 - 08:30)', description: '4x4 Open Jeep excursion across black lava fields for volcanic sunrise.', tip: 'Bring a light fleece jacket as summit mornings can be chilly.' },
      { name: 'Uluwatu Cliff Temple & Kecak Fire Dance', category: 'Cultural', rating: 4.92, time: 'Sunset (17:30 - 19:30)', description: 'Dramatic ocean cliff temple featuring traditional sunset fire dance.', tip: 'Watch out for cheeky monkeys and secure sunglasses/phones.' },
    ],
    hotels: [
      { name: 'Four Seasons Resort Bali at Sayan', tier: 'Luxury', rating: 4.97, pricePerNight: 62000, area: 'Ubud Jungle', amenities: ['Ayung River Villas', 'Sacred River Spa', 'Suspension Bridge'] },
      { name: 'The Kayon Jungle Resort', tier: 'Boutique', rating: 4.94, pricePerNight: 28000, area: 'Payangan, Ubud', amenities: ['Three-tier Infinity Pools', 'Valley Views', 'Complimentary Yoga'] },
      { name: 'Komaneka at Monkey Forest', tier: 'Comfort', rating: 4.88, pricePerNight: 12000, area: 'Ubud Center', amenities: ['Private Garden Pool', 'Traditional Balinese Spa', 'Afternoon Tea'] },
      { name: 'Tribal Bali Co-working Hostel', tier: 'Budget', rating: 4.82, pricePerNight: 2200, area: 'Pererenan, Canggu', amenities: ['Olympic Pool', 'Fast Fiber Internet', 'Organic Cafe'] },
    ],
    restaurants: [
      { name: 'Locavore NXT', cuisine: 'Innovative Indonesian Fine Dining', rating: 4.96, priceLevel: '$$$$', mustTry: 'Multi-course Local Foraged Tasting Menu', neighborhood: 'Ubud' },
      { name: 'Warung Babi Guling Ibu Oka', cuisine: 'Traditional Balinese Roast Pork', rating: 4.88, priceLevel: '$', mustTry: 'Crispy Skin Suckling Pork with Sambal Matah', neighborhood: 'Ubud Palace' },
      { name: 'Crate Cafe & Bakery', cuisine: 'Healthy Brunch & Specialty Coffee', rating: 4.9, priceLevel: '$', mustTry: 'Acai Bowls, Avocado Sourdough & Flat White', neighborhood: 'Canggu' },
    ],
    reviews: [
      { author: 'Liam Hemsworth', location: 'Melbourne, Australia', rating: 5, date: '5 days ago', text: 'The warmth and hospitality of Balinese people is unmatched. Renting a scooter and driving through rice paddies was the highlight of my year.', verified: true },
      { author: 'Pooja Iyer', location: 'Mumbai, India', rating: 5, date: '1 week ago', text: 'Ubud is pure serenity. Make sure to try local coffee luwak and take a sunset yoga class overlooking the jungle valley.', verified: true },
    ],
    safetyScore: 9.4,
    currency: 'IDR (Indonesian Rupiah)',
    plugType: 'Type C / F (230V)',
  },
  girnar: {
    country: 'India',
    flag: '🇮🇳',
    lat: 21.5273,
    lon: 70.5312,
    transit: [
      { mode: 'Ropeway', title: 'Usha Breco Girnar Ropeway', duration: '8 mins to Ambaji Peak', cost: 750, provider: 'Girnar Ropeway Management', frequency: 'Continuous (07:00 - 17:00)' },
      { mode: 'Train', title: 'Western Railway Express to Junagadh Junction (JND)', duration: '6-8h from Ahmedabad/Surat', cost: 650, provider: 'Indian Railways (IRCTC)', frequency: 'Multiple Daily Trains' },
      { mode: 'Cab / Bus', title: 'GSRTC Volvo & Private Taxi to Bhavnath Foothills', duration: '20 mins from Junagadh Town', cost: 250, provider: 'GSRTC / Local Taxis', frequency: 'Every 15 mins' },
    ],
    places: [
      { name: 'Girnar Ropeway & Ambaji Temple Peak', category: 'Scenic & Spiritual', rating: 4.95, time: 'Early Morning (06:30 - 10:30)', description: 'Asia’s longest ropeway ascending to the ancient Ambaji Temple on the summit with breathtaking valley views.', tip: 'Take the first ropeway slot at 7 AM to witness the morning sun rising above the cloud blanket.' },
      { name: 'Guru Gorakhnath Peak & Dattatreya Summit', category: 'Trekking & Heritage', rating: 4.92, time: 'Morning (08:00 - 13:00)', description: 'The highest point in Gujarat (1,117m) surrounded by panoramic ridge walks.', tip: 'Carry 2 liters of water and energy bars for the staircase walk between peaks.' },
      { name: 'Neminath & Historic Jain Temples Complex', category: 'Cultural & Historic', rating: 4.9, time: 'Morning (10:00 - 12:30)', description: 'Exquisite 12th-century marble temple carvings on the sacred 5th peak.', tip: 'Notice the intricate white marble pillars rivaling Delwara temples.' },
      { name: 'Uparkot Ancient Fort & Buddhist Caves', category: 'Historic Monument', rating: 4.88, time: 'Afternoon (14:30 - 17:00)', description: '2,300-year-old fort with Adi Kadi Stepwell, Buddhist rock-cut caves, and Navghan Kuwo.', tip: 'Hire an official local guide at the gate to learn the Mauryan history.' },
      { name: 'Mahabat Maqbara Palace Mausoleum', category: 'Architecture', rating: 4.89, time: 'Evening (16:30 - 18:30)', description: 'Spectacular Gothic and Indo-Islamic architecture with winding spiral minaret staircases.', tip: 'Golden hour sunlight illuminates the yellow sandstone carvings beautifully.' },
      { name: 'Bhavnath Mahadev Temple & Damodar Kund', category: 'Cultural', rating: 4.85, time: 'Evening (18:30 - 20:00)', description: 'Sacred foothills temple and natural reservoir at the base of Mount Girnar.', tip: 'Attend the evening Maha Aarti bells at Bhavnath.' },
    ],
    hotels: [
      { name: 'The Fern Leo Resort & Club Junagadh', tier: 'Luxury', rating: 4.9, pricePerNight: 7500, area: 'Talav Gate / Bypass Road', amenities: ['Swimming Pool', 'Multi-Cuisine Restaurant', 'Fitness Center', 'Lush Lawns'] },
      { name: 'Toran Hill Resort (TCGL)', tier: 'Boutique', rating: 4.84, pricePerNight: 3500, area: 'Bhavnath Foothills', amenities: ['Scenic Mountain Views', 'Ropeway Proximity', 'Pure Veg Dining', 'Travel Desk'] },
      { name: 'Hotel Bellevue Sarovar Portico', tier: 'Comfort', rating: 4.82, pricePerNight: 4800, area: 'Station Road', amenities: ['Free Wi-Fi', 'Air Conditioning', 'Buffet Breakfast', 'Valet Parking'] },
      { name: 'Hotel Vishala & Heritage Stay', tier: 'Comfort', rating: 4.78, pricePerNight: 2800, area: 'Kalwa Chowk', amenities: ['Room Service', 'Family Suites', 'Free High-speed Wi-Fi'] },
      { name: 'Shri Swaminarayan Atithi Bhavan', tier: 'Budget', rating: 4.75, pricePerNight: 1200, area: 'Majevadi Gate', amenities: ['Clean Rooms', 'Pure Satvik Dining', 'Peaceful Atmosphere'] },
    ],
    restaurants: [
      { name: 'Geeta Lodge (Famous Kathiyawadi Thali)', cuisine: 'Authentic Kathiyawadi & Gujarati Dining', rating: 4.93, priceLevel: '$$', mustTry: 'Unlimited Gujarati Thali with Bajra No Rotlo, Ringna No Olo & Jaggery Butter', neighborhood: 'Station Road, Junagadh' },
      { name: 'The Petal Restaurant', cuisine: 'Multi-Cuisine & North Indian', rating: 4.88, priceLevel: '$$', mustTry: 'Paneer Angara, Dal Tadka & Tandoori Kulcha', neighborhood: 'Zanzarda Road' },
      { name: 'Bethak Cafe & Restorant', cuisine: 'Cafe, Fast Food & Beverages', rating: 4.85, priceLevel: '$', mustTry: 'Bethak Special Cold Coffee & Grilled Sandwiches', neighborhood: 'Moti Baug Road' },
      { name: 'Santoor Restaurant', cuisine: 'Vegetarian Specialties & Gujarati', rating: 4.87, priceLevel: '$$', mustTry: 'Gujarati Dal Bati & Kaju Curry', neighborhood: 'College Road' },
      { name: 'Utsav Restaurant & Banquet', cuisine: 'North Indian & Punjabi', rating: 4.82, priceLevel: '$$', mustTry: 'Sizzler Plates & Garlic Naan', neighborhood: 'Bypass Road' },
      { name: 'Chamunda Lassi & Farsan Mart', cuisine: 'Traditional Sweets & Street Snacks', rating: 4.9, priceLevel: '$', mustTry: 'Thick Malai Lassi, Hot Fafda Jalebi & Khaman', neighborhood: 'Bhavnath Taleti' },
    ],
    reviews: [
      { author: 'Chirag Vora', location: 'Rajkot, India', rating: 5, date: '2 days ago', text: 'The new Girnar Ropeway made the Ambaji darshan so effortless! Highly recommend booking the ropeway slot online. Evening dinner at Geeta Lodge was delicious.', verified: true },
      { author: 'Pooja Trivedi', location: 'Ahmedabad, India', rating: 5, date: '1 week ago', text: 'Uparkot Fort and Mahabat Maqbara are architectural masterpieces. Junagadh is peaceful and rich with history.', verified: true },
    ],
    safetyScore: 9.8,
    currency: 'INR (₹)',
    plugType: 'Type C / D / M (230V)',
  },
  manali: {
    country: 'India',
    flag: '🇮🇳',
    lat: 32.2396,
    lon: 77.1887,
    transit: [
      { mode: 'Flight', title: 'Flight to Kullu-Manali Airport (KUU)', duration: '1h 20m from Delhi', cost: 6500, provider: 'Alliance Air', frequency: 'Daily' },
      { mode: 'Volvo Bus', title: 'HPTDC / Zingbus Luxury Sleeper Bus', duration: '12h from Delhi / Chandigarh', cost: 1400, provider: 'HPTDC / Private Operators', frequency: 'Every 30 mins (Evening)' },
      { mode: 'Taxi', title: 'Private 4x4 Cab to Solang & Rohtang', duration: '1h 30m', cost: 2200, provider: 'Manali Taxi Union', frequency: 'On-demand' },
    ],
    places: [
      { name: 'Solang Valley & Rohtang Pass', category: 'Snow & Adventure', rating: 4.94, time: 'Full Day (08:00 - 15:30)', description: 'Snow sports hub with paragliding, zorbing, skiing, and snow scooter rides.', tip: 'Obtain NGT Rohtang permit online 2 days in advance.' },
      { name: 'Hadimba Devi Ancient Wooden Temple', category: 'Heritage & Nature', rating: 4.9, time: 'Morning (09:00 - 11:30)', description: 'Four-tiered wooden pagoda temple surrounded by towering deodar cedar forests.', tip: 'Take photos with local angora rabbits and traditional Himachali attire outside.' },
      { name: 'Old Manali & Manalsu River Walk', category: 'Bohemian & Cafe', rating: 4.88, time: 'Evening (16:30 - 20:00)', description: 'Charming stone-and-wood village filled with live acoustic music cafes.', tip: 'Try the fresh river trout and apple crumble pie.' },
      { name: 'Jogini Waterfall Trek', category: 'Trekking & Scenic', rating: 4.92, time: 'Morning (08:30 - 12:00)', description: 'Picturesque pine forest hike starting from Vashisht hot springs to cascading falls.', tip: 'Take a dip in the natural sulfur hot water spring in Vashisht.' },
    ],
    hotels: [
      { name: 'The Himalayan Resort & Spa', tier: 'Luxury', rating: 4.94, pricePerNight: 16000, area: 'Hadimba Road', amenities: ['Victorian Castle Suites', 'Heated Outdoor Pool', 'Orchard Views'] },
      { name: 'Larisa Resort Manali', tier: 'Boutique', rating: 4.9, pricePerNight: 9500, area: 'Haripur, Manali', amenities: ['Apple Orchards', 'Organic Farm Dining', 'Mountain Jacuzzi'] },
      { name: 'Sterling Manali', tier: 'Comfort', rating: 4.82, pricePerNight: 4800, area: 'Prini', amenities: ['Snow View Balconies', 'Campfire & Music', 'Free Wi-Fi'] },
      { name: 'Zostel Manali (Old Manali)', tier: 'Budget', rating: 4.85, pricePerNight: 1600, area: 'Old Manali', amenities: ['Garden Cafe', 'Co-working', 'Rooftop Common Room'] },
    ],
    restaurants: [
      { name: 'Cafe 1947', cuisine: 'Italian, Continental & Live Music', rating: 4.91, priceLevel: '$$$', mustTry: 'Wood-fired Thin Crust Pizza & Trout Fish', neighborhood: 'Old Manali (Riverbank)' },
      { name: 'Drifters’ Cafe', cuisine: 'European Cafe & Breakfast', rating: 4.88, priceLevel: '$$', mustTry: 'Shakshuka, Waffles & Hot Spiced Apple Cider', neighborhood: 'Manu Temple Road' },
      { name: 'Johnson’s Cafe & Bar', cuisine: 'Continental & Bar', rating: 4.9, priceLevel: '$$$', mustTry: 'Baked Trout in Almond Butter Sauce', neighborhood: 'Circuit House Road' },
      { name: 'Chopsticks Restaurant', cuisine: 'Tibetan & Himalayan', rating: 4.84, priceLevel: '$', mustTry: 'Steamed Momos, Thukpa & Fruit Beer', neighborhood: 'The Mall Road' },
    ],
    reviews: [
      { author: 'Rohit Sharma', location: 'Chandigarh, India', rating: 5, date: '3 days ago', text: 'Old Manali cafes and the Jogini falls trek were magical. Cafe 1947 by the river is an experience not to be missed!', verified: true },
    ],
    safetyScore: 9.7,
    currency: 'INR (₹)',
    plugType: 'Type C / D / M (230V)',
  },
  jaipur: {
    country: 'India',
    flag: '🇮🇳',
    lat: 26.9124,
    lon: 75.7873,
    transit: [
      { mode: 'Flight', title: 'Direct Flights to Jaipur International (JAI)', duration: '1h from Delhi/Mumbai', cost: 3500, provider: 'IndiGo / Air India', frequency: 'Daily (10 flights)' },
      { mode: 'Train', title: 'Vande Bharat & Shatabdi Express', duration: '3h 40m from Delhi', cost: 950, provider: 'Indian Railways', frequency: 'Daily' },
      { mode: 'Cab / Auto', title: 'Private Tourist Taxi & Auto Rickshaws', duration: 'Full Day', cost: 1800, provider: 'Local Operators', frequency: 'On-demand' },
    ],
    places: [
      { name: 'Amber Fort & Sheesh Mahal', category: 'Historic Palace', rating: 4.95, time: 'Morning (08:30 - 12:30)', description: 'Grand hilltop Rajput fortress with mirror palace and panoramic lake views.', tip: 'Book the evening sound and light show or take early morning elephant/jeep ride.' },
      { name: 'Hawa Mahal & City Palace Complex', category: 'Iconic Heritage', rating: 4.9, time: 'Afternoon (13:30 - 16:30)', description: 'The famous Palace of Winds with 953 honeycomb windows and royal courtyards.', tip: 'Visit Tattoo Cafe or Wind View Cafe across the street for iconic facade photos.' },
      { name: 'Nahargarh Fort Sunset Viewpoint', category: 'Scenic Sunset', rating: 4.92, time: 'Sunset (17:00 - 19:30)', description: 'Stunning sunset perch overlooking the glowing Pink City below.', tip: 'Have high tea at the rooftop restaurant inside the fort.' },
    ],
    hotels: [
      { name: 'The Leela Palace Jaipur', tier: 'Luxury', rating: 4.97, pricePerNight: 35000, area: 'Amber Road', amenities: ['Royal Courtyards', 'Heritage Spa', 'Grand Dining'] },
      { name: 'Samode Haveli', tier: 'Boutique', rating: 4.92, pricePerNight: 16000, area: 'Old Pink City', amenities: ['Historic Frescoes', 'Mughal Swimming Pool', 'Elephant Fountain'] },
      { name: 'Umaid Bhawan Heritage House Hotel', tier: 'Comfort', rating: 4.85, pricePerNight: 4200, area: 'Bani Park', amenities: ['Carved Balconies', 'Rooftop Pool', 'Folk Dance Evenings'] },
      { name: 'Moustache Hostel Jaipur', tier: 'Budget', rating: 4.78, pricePerNight: 1200, area: 'MI Road', amenities: ['Rooftop Cafe', 'Stepwell Common Area', 'Free Walking Tours'] },
    ],
    restaurants: [
      { name: '1135 AD (Amber Fort)', cuisine: 'Royal Mughlai & Rajasthani Fine Dining', rating: 4.92, priceLevel: '$$$$', mustTry: 'Laal Maas, Shahi Tukda & Rajput Thali', neighborhood: 'Amber Fort' },
      { name: 'LMB (Laxmi Mishthan Bhandar)', cuisine: 'Traditional Rajasthani & Sweets', rating: 4.88, priceLevel: '$$', mustTry: 'Special Rajasthani Royal Thali & Paneer Ghewar', neighborhood: 'Johari Bazaar' },
      { name: 'Rawat Mishthan Bhandar', cuisine: 'Famous Rajasthani Snacks', rating: 4.9, priceLevel: '$', mustTry: 'World-famous Pyaaz Kachori & Mawa Kachori', neighborhood: 'Station Road' },
      { name: 'Tapri Central', cuisine: 'Modern Rooftop Chai & Bites', rating: 4.92, priceLevel: '$$', mustTry: 'Handcrafted Masala Chai & Sauteed Mushroom Toast', neighborhood: 'C Scheme' },
    ],
    reviews: [
      { author: 'Meera Rajput', location: 'Indore, India', rating: 5, date: '2 days ago', text: 'Jaipur is a vibrant royal feast for the senses. Pyaaz kachori at Rawat and sunset at Nahargarh Fort were unmatched!', verified: true },
    ],
    safetyScore: 9.6,
    currency: 'INR (₹)',
    plugType: 'Type C / D / M (230V)',
  },
  goa: {
    country: 'India',
    flag: '🇮🇳',
    lat: 15.2993,
    lon: 74.124,
    transit: [
      { mode: 'Flight', title: 'Direct Flights to Mopa (GOX) / Dabolim (GOI)', duration: '1h 15m from Mumbai/Bangalore', cost: 3800, provider: 'All Major Airlines', frequency: 'Frequent Flights' },
      { mode: 'Scooter Rental', title: 'Self-drive Scooters & Thar Jeeps', duration: 'Daily', cost: 400, provider: 'Local Beachside Rentals', frequency: 'Instant' },
      { mode: 'Train', title: 'Madgaon (MAO) Konkan Railway Express', duration: '8h from Mumbai', cost: 850, provider: 'Indian Railways', frequency: 'Daily' },
    ],
    places: [
      { name: 'Palolem Beach & Butterfly Island', category: 'Beaches & Relaxation', rating: 4.94, time: 'Morning (08:00 - 12:00)', description: 'Crescent-shaped white sand bay with calm turquoise waters and dolphin boat trips.', tip: 'Rent a transparent kayak to paddle around the bay.' },
      { name: 'Fort Aguada & Sinquerim Lighthouse', category: 'Coastal Heritage', rating: 4.89, time: 'Sunset (16:30 - 18:30)', description: '17th-century Portuguese fortress commanding panoramic Arabian Sea views.', tip: 'Arrive 1 hour before sunset to see the golden glow over the ocean.' },
      { name: 'Fontainhas Latin Quarter', category: 'Heritage & Walk', rating: 4.91, time: 'Afternoon (14:30 - 17:00)', description: 'Vibrant Portuguese heritage quarter with pastel-painted villas and bakeries.', tip: 'Stop by Confeitaria 31 De Janeiro for authentic warm Bebinca.' },
    ],
    hotels: [
      { name: 'Taj Exotica Resort & Spa Goa', tier: 'Luxury', rating: 4.96, pricePerNight: 28000, area: 'Benaulim, South Goa', amenities: ['Private Beach', 'Golf Course', 'Jiva Spa'] },
      { name: 'Ahilya by the Sea', tier: 'Boutique', rating: 4.93, pricePerNight: 22000, area: 'Nerul, North Goa', amenities: ['Ocean Edge Infinity Pools', 'Frangipani Gardens', 'Gourmet Dining'] },
      { name: 'Santana Beach Resort', tier: 'Comfort', rating: 4.84, pricePerNight: 4500, area: 'Candolim', amenities: ['Beach Access', 'Two Swimming Pools', 'Tropical Gardens'] },
      { name: 'The Hosteller Goa (Anjuna)', tier: 'Budget', rating: 4.8, pricePerNight: 1400, area: 'Anjuna', amenities: ['Swimming Pool', 'Co-working Cafe', 'Beach Parties'] },
    ],
    restaurants: [
      { name: 'Fisherman’s Wharf', cuisine: 'Goan Seafood & Riverside Dining', rating: 4.92, priceLevel: '$$$', mustTry: 'Goan Fish Curry Rice, Butter Garlic Prawns & Crab Xec Xec', neighborhood: 'Cavelossim (River Sal)' },
      { name: 'Gunpowder', cuisine: 'South Indian & Coastal', rating: 4.91, priceLevel: '$$', mustTry: 'Kerala Beef Fry, Appams & Pandi Curry', neighborhood: 'Assagao' },
      { name: 'Curlies & Shiva Valley', cuisine: 'Beach Shack & Continental', rating: 4.85, priceLevel: '$$', mustTry: 'Wood-fired Pizza, Fresh Juices & Calamari', neighborhood: 'Anjuna Beach' },
      { name: 'Mum’s Kitchen', cuisine: 'Traditional Goan Heritage', rating: 4.88, priceLevel: '$$$', mustTry: 'Pork Vindaloo, Prawn Balchao & Kokum Cooler', neighborhood: 'Panaji' },
    ],
    reviews: [
      { author: 'Ankit Gupta', location: 'Pune, India', rating: 5, date: '1 day ago', text: 'South Goa beaches are so peaceful and pristine! Seafood at Fisherman’s Wharf by the river was divine.', verified: true },
    ],
    safetyScore: 9.5,
    currency: 'INR (₹)',
    plugType: 'Type C / D / M (230V)',
  },
};

async function fetchOnlineDestinationIntelligence(destName, originName, durationDays, budgetLevel, travelStyle) {
  const query = String(destName || 'Global').trim();
  const lower = query.toLowerCase();

  const formatWithMaps = (items, defaultLoc) => {
    return (items || []).map((it) => {
      const loc = it.neighborhood || it.area || defaultLoc || query;
      const mapQuery = `${it.name}, ${loc}`;
      return {
        ...it,
        googleMapsUrl:
          it.googleMapsUrl ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
      };
    });
  };

  // Check static global intelligence first for instant rich responses on top hubs
  for (const [k, v] of Object.entries(GLOBAL_CITY_INTELLIGENCE)) {
    if (lower.includes(k) || k.includes(lower)) {
      return {
        ...v,
        places: formatWithMaps(v.places, query),
        hotels: formatWithMaps(v.hotels, query),
        restaurants: formatWithMaps(v.restaurants, query),
        exploreRestaurantsUrl: `https://www.google.com/maps/search/?api=1&query=restaurants+near+${encodeURIComponent(
          query
        )}`,
        exploreAttractionsUrl: `https://www.google.com/maps/search/?api=1&query=things+to+do+near+${encodeURIComponent(
          query
        )}`,
        exploreHotelsUrl: `https://www.google.com/maps/search/?api=1&query=hotels+near+${encodeURIComponent(
          query
        )}`,
      };
    }
  }

  // Geocode via OpenStreetMap Nominatim
  let lat = 21.5275;
  let lon = 70.5332;
  let country = 'India';
  let countryCode = 'IN';

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1&addressdetails=1`;
    const geoRes = await fetch(geoUrl, {
      headers: {
        'User-Agent': 'GlobeTrotter-Travel-App/1.0 (travel@globetrotter.io)',
        'Accept-Language': 'en',
      },
    });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData && geoData[0]) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
        country = geoData[0].address?.country || 'Global';
        countryCode = geoData[0].address?.country_code
          ? geoData[0].address.country_code.toUpperCase()
          : 'GL';
      }
    }
  } catch (e) {
    console.warn('Geocoding fetch error:', e.message);
  }

  const flag = getCountryFlag(countryCode);

  // Fetch REAL online hotels from OpenStreetMap
  let hotels = [];
  try {
    const hotelUrl = `https://nominatim.openstreetmap.org/search?format=json&q=hotel+in+${encodeURIComponent(
      query
    )}&limit=8&addressdetails=1`;
    const hotelRes = await fetch(hotelUrl, {
      headers: {
        'User-Agent': 'GlobeTrotter-Travel-App/1.0',
        'Accept-Language': 'en',
      },
    });
    if (hotelRes.ok) {
      const hData = await hotelRes.json();
      if (Array.isArray(hData) && hData.length > 0) {
        hotels = hData
          .filter((item) => item.name && item.name.length > 2)
          .map((item, idx) => {
            const tier =
              idx === 0 ? 'Luxury' : idx === 1 ? 'Boutique' : idx === 2 ? 'Comfort' : 'Budget';
            const pricePerNight =
              tier === 'Luxury' ? 14000 : tier === 'Boutique' ? 7500 : tier === 'Comfort' ? 3800 : 1800;
            return {
              name: item.name || `Hotel in ${query}`,
              tier,
              rating: parseFloat((4.8 + (idx % 3) * 0.05).toFixed(2)),
              pricePerNight,
              area: item.address?.suburb || item.address?.city || item.address?.county || query,
              amenities: ['Free High-Speed Wi-Fi', 'Breakfast', 'Scenic View', 'Air Conditioning'],
            };
          });
      }
    }
  } catch (e) {
    console.warn('Hotels fetch error:', e.message);
  }

  // Fetch REAL online restaurants from OpenStreetMap
  let restaurants = [];
  try {
    const restUrl = `https://nominatim.openstreetmap.org/search?format=json&q=restaurant+in+${encodeURIComponent(
      query
    )}&limit=8&addressdetails=1`;
    const restRes = await fetch(restUrl, {
      headers: {
        'User-Agent': 'GlobeTrotter-Travel-App/1.0',
        'Accept-Language': 'en',
      },
    });
    if (restRes.ok) {
      const rData = await restRes.json();
      if (Array.isArray(rData) && rData.length > 0) {
        restaurants = rData
          .filter((item) => item.name && item.name.length > 2)
          .map((item, idx) => {
            return {
              name: item.name || `Restaurant in ${query}`,
              cuisine: idx % 2 === 0 ? 'Authentic Regional Delicacies' : 'Traditional Dining & Snacks',
              rating: parseFloat((4.85 + (idx % 3) * 0.04).toFixed(2)),
              priceLevel: idx === 0 ? '$$$' : '$$',
              mustTry:
                idx === 0 ? 'Signature Regional Thali & Specialties' : 'Fresh Local Delicacies & Tea',
              neighborhood: item.address?.suburb || item.address?.city || item.address?.county || query,
            };
          });
      }
    }
  } catch (e) {
    console.warn('Restaurants fetch error:', e.message);
  }

  // Fetch REAL online attractions from OpenStreetMap
  let places = [];
  try {
    const attrUrl = `https://nominatim.openstreetmap.org/search?format=json&q=attraction+in+${encodeURIComponent(
      query
    )}&limit=8&addressdetails=1`;
    const attrRes = await fetch(attrUrl, {
      headers: {
        'User-Agent': 'GlobeTrotter-Travel-App/1.0',
        'Accept-Language': 'en',
      },
    });
    if (attrRes.ok) {
      const aData = await attrRes.json();
      if (Array.isArray(aData) && aData.length > 0) {
        places = aData
          .filter((item) => item.name && item.name.length > 2)
          .map((item, idx) => {
            return {
              name: item.name || `Attraction in ${query}`,
              category: idx % 2 === 0 ? 'Scenic & Trekking' : 'Cultural & Heritage',
              rating: 4.9,
              time: idx === 0 ? 'Early Morning (06:00 - 10:00)' : 'Sunset (16:30 - 19:00)',
              description: `Explore ${item.name || query}, a premier attraction and scenic spot in ${country}.`,
              tip: 'Carry drinking water and start early to catch the panoramic sunrise vista.',
            };
          });
      }
    }
  } catch (e) {
    console.warn('Attractions fetch error:', e.message);
  }

  // Fallbacks if online items were empty
  if (hotels.length === 0) {
    hotels = [
      { name: `The Grand Retreat ${query}`, tier: 'Luxury', rating: 4.92, pricePerNight: 12000, area: query, amenities: ['Scenic View', 'Spa', 'Fine Dining'] },
      { name: `Heritage Lodge ${query}`, tier: 'Boutique', rating: 4.86, pricePerNight: 6500, area: query, amenities: ['Breakfast', 'Garden', 'Room Service'] },
      { name: `Comfort Inn ${query}`, tier: 'Comfort', rating: 4.8, pricePerNight: 3500, area: query, amenities: ['Free Wi-Fi', 'AC Rooms'] },
      { name: `Backpackers Stay ${query}`, tier: 'Budget', rating: 4.75, pricePerNight: 1800, area: query, amenities: ['Shared Kitchen', 'Lounge'] },
    ];
  }

  if (restaurants.length === 0) {
    restaurants = [
      { name: `Royal Dining ${query}`, cuisine: 'Authentic Regional Delicacies', rating: 4.9, priceLevel: '$$$', mustTry: 'Chef’s Special Regional Platter', neighborhood: query },
      { name: `Old Town Cafe ${query}`, cuisine: 'Cafe & Local Specialities', rating: 4.85, priceLevel: '$$', mustTry: 'Fresh Local Snacks & Masala Chai', neighborhood: query },
      { name: `Street Food Junction ${query}`, cuisine: 'Street Food & Snacks', rating: 4.82, priceLevel: '$', mustTry: 'Signature Hot Farsan & Samosas', neighborhood: query },
    ];
  }

  if (places.length === 0) {
    places = [
      { name: `${query} Mountain Trail & Viewpoint`, category: 'Adventure', rating: 4.95, time: 'Sunrise (06:00 - 09:30)', description: `Scenic summit trek offering panoramic 360-degree views across ${query}.`, tip: 'Arrive before 7 AM for the golden hour sunrise.' },
      { name: `${query} Heritage & Sacred Temples`, category: 'Cultural', rating: 4.92, time: 'Morning (09:30 - 12:30)', description: `Ancient architecture and historic pilgrim complex nestled in ${query}.`, tip: 'Ropeway cable car ride is recommended for quick ascent.' },
      { name: `${query} Valley Nature Walk`, category: 'Nature', rating: 4.88, time: 'Evening (16:00 - 18:30)', description: `Tranquil nature trail surrounded by lush greenery and mountain breezes.`, tip: 'Carry binoculars for spotting local bird species.' },
    ];
  }

  return {
    country,
    flag,
    lat,
    lon,
    transit: [
      { mode: 'Flight / Train', title: `Route from ${originName} to ${query}`, duration: '3-6 Hours', cost: 6500, provider: 'National Transit Network', frequency: 'Daily Service' },
      { mode: 'Scenic Highway', title: `Express Road & Taxi Route to ${query}`, duration: '2-4 Hours', cost: 1800, provider: 'Local Cab / Bus Transport', frequency: 'Frequent Departures' },
      { mode: 'Local Pass', title: `${query} Local Sightseeing & Ropeway Pass`, duration: `${durationDays || 5} Days`, cost: 950, provider: 'Tourism Department', frequency: 'Unlimited Travel' },
    ],
    places: formatWithMaps(places, query),
    hotels: formatWithMaps(hotels, query),
    restaurants: formatWithMaps(restaurants, query),
    exploreRestaurantsUrl: `https://www.google.com/maps/search/?api=1&query=restaurants+near+${encodeURIComponent(
      query
    )}`,
    exploreAttractionsUrl: `https://www.google.com/maps/search/?api=1&query=things+to+do+near+${encodeURIComponent(
      query
    )}`,
    exploreHotelsUrl: `https://www.google.com/maps/search/?api=1&query=hotels+near+${encodeURIComponent(
      query
    )}`,
    reviews: [
      { author: 'Rahul Mehta', location: 'Ahmedabad, India', rating: 5, date: '3 days ago', text: `${query} is an absolute must-visit! The ropeway experience and serene hill views made it an unforgettable journey.`, verified: true },
      { author: 'Sneha Patel', location: 'Mumbai, India', rating: 5, date: '1 week ago', text: `Incredible spiritual energy and stunning landscapes. Clean facilities and authentic local food stalls near the foothills!`, verified: true },
    ],
    safetyScore: 9.6,
    currency: country === 'India' ? 'INR (₹)' : 'Local Currency',
    plugType: 'Type C / D / M',
  };
}

// 1. AI Trip Planning Endpoint
app.post('/api/ai/plan-trip', async (req, res) => {
  try {
    const {
      origin = 'New Delhi',
      destination = 'Tokyo',
      durationDays = 5,
      budgetLevel = 'Moderate',
      travelStyle = 'Culture & Adventure',
      companions = 'Solo / Friends',
    } = req.body;

    const cityData = await fetchOnlineDestinationIntelligence(
      destination,
      origin,
      durationDays,
      budgetLevel,
      travelStyle
    );

    // Generate dynamic Day-by-Day schedule
    const numDays = Math.max(2, Math.min(10, Number(durationDays) || 5));
    const daySchedules = [];

    for (let i = 1; i <= numDays; i++) {
      const placeItem = cityData.places[(i - 1) % cityData.places.length];
      const restItem = cityData.restaurants[(i - 1) % cityData.restaurants.length];

      daySchedules.push({
        dayNumber: i,
        theme:
          i === 1
            ? 'Arrival, Welcome & First Impressions'
            : i === numDays
            ? 'Farewell Sightseeing & Departure'
            : `Day ${i}: Deep Dive & Excursions`,
        activities: [
          {
            id: `ai-act-${i}-1`,
            time: '09:00',
            title: placeItem.name,
            category: placeItem.category || 'Sightseeing',
            location: `${placeItem.name}, ${destination}`,
            cost: i === 1 ? 0 : 2500,
            tip: placeItem.tip,
          },
          {
            id: `ai-act-${i}-2`,
            time: '13:00',
            title: `Lunch at ${restItem.name}`,
            category: 'Dining',
            location: restItem.neighborhood,
            cost:
              restItem.priceLevel === '$$$$'
                ? 4500
                : restItem.priceLevel === '$$$'
                ? 2500
                : 1200,
            tip: `Must-try: ${restItem.mustTry}`,
          },
          {
            id: `ai-act-${i}-3`,
            time: '16:00',
            title: `Scenic Sunset Walk & ${travelStyle} Exploration`,
            category: 'Adventure',
            location: destination,
            cost: 1000,
            tip: 'Carry comfortable walking shoes and a portable power bank.',
          },
        ],
      });
    }

    // Cost estimation
    const flightEst = cityData.transit[0]?.cost || 15000;
    const hotelEstPerNight = cityData.hotels[1]?.pricePerNight || 6000;
    const foodEstPerDay = 2500;
    const activitiesEst = numDays * 2000;
    const totalEst =
      flightEst +
      hotelEstPerNight * (numDays - 1) +
      foodEstPerDay * numDays +
      activitiesEst;

    const plan = {
      title: `${destination} AI Explorer Blueprint`,
      origin,
      destination,
      durationDays: numDays,
      budgetLevel,
      travelStyle,
      companions,
      flag: cityData.flag,
      country: cityData.country,
      lat: cityData.lat,
      lon: cityData.lon,
      safetyScore: cityData.safetyScore,
      currency: cityData.currency,
      plugType: cityData.plugType,
      transitOptions: cityData.transit,
      placesToDiscover: cityData.places,
      hotels: cityData.hotels,
      restaurants: cityData.restaurants,
      reviews: cityData.reviews,
      daySchedules,
      costBreakdown: {
        flights: flightEst,
        lodging: hotelEstPerNight * (numDays - 1),
        foodAndDining: foodEstPerDay * numDays,
        activities: activitiesEst,
        total: totalEst,
      },
      packingAdvice: [
        '👟 Comfortable walking/hiking footwear',
        `🔌 Universal plug adapter (${cityData.plugType})`,
        '💳 Multi-currency debit card + local cash reserve',
        '📱 Offline map download and local eSIM profile',
      ],
    };

    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. AI Travel Copilot Chat Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const msgLower = message.toLowerCase();
    let reply = '';

    if (msgLower.includes('pack') || msgLower.includes('clothing') || msgLower.includes('wear')) {
      reply = `🧥 **Smart Packing Guide for ${context?.destination || 'Your Journey'}**:\n\n` +
        `• **Footwear**: Sturdy, broken-in walking sneakers or trail shoes.\n` +
        `• **Layering**: Breathable base layers, a lightweight windbreaker, and a fleece for cool evenings.\n` +
        `• **Electronics**: Universal travel adapter (${context?.plugType || 'Type C/G'}), high-capacity power bank, noise-cancelling headphones.\n` +
        `• **Documents**: Passport (6+ months validity), travel insurance card, offline map copies.\n` +
        `• **Toiletries**: High-SPF sunscreen, lip balm, and personal medication pouch.`;
    } else if (msgLower.includes('food') || msgLower.includes('eat') || msgLower.includes('restaurant') || msgLower.includes('vegetarian') || msgLower.includes('vegan')) {
      reply = `🍽️ **Culinary & Dining Guide for ${context?.destination || 'Your Destination'}**:\n\n` +
        `• **Local Delicacies**: Sample signature regional dishes at neighborhood bistros rather than tourist promenades.\n` +
        `• **Dietary Preferences**: Look out for dedicated vegetarian and green cafes—download HappyCow or local dining apps.\n` +
        `• **Tipping Culture**: Check if service charge is already included in your bill.\n` +
        `• **Reservations**: For Michelin-starred or popular heritage diners, reserve 2–4 weeks in advance.`;
    } else if (msgLower.includes('hotel') || msgLower.includes('stay') || msgLower.includes('where to stay')) {
      reply = `🏨 **Accommodation Recommendations**:\n\n` +
        `• **Best Area**: Stay within 5–10 minutes walking distance of a central metro/train hub.\n` +
        `• **Boutique Picks**: Heritage chalets, Japanese ryokans, or boutique canal hotels offer the most memorable cultural stay.\n` +
        `• **Budget Tip**: Book accommodations with complimentary breakfast and free cancellation.`;
    } else if (msgLower.includes('flight') || msgLower.includes('transit') || msgLower.includes('train') || msgLower.includes('reach') || msgLower.includes('how to get')) {
      reply = `✈️ **Transit & Transport Recommendations**:\n\n` +
        `• **Flights**: Book direct red-eye or early morning flights for minimal layover delays.\n` +
        `• **Rail Network**: High-speed trains (TGV, Shinkansen, ICE) are often faster city-center to city-center than flying.\n` +
        `• **City Travel Card**: Get an unlimited multi-day tourist subway/bus transit pass on arrival to save up to 40% on fares.`;
    } else {
      reply = `✨ **GlobeTrotter AI Travel Copilot**:\n\n` +
        `I’d love to help you plan your journey to **${context?.destination || 'your next destination'}**!\n\n` +
        `• **How to Reach**: Seamless flight & rail transit route comparisons.\n` +
        `• **Top Sights & Hidden Gems**: Curated viewpoints and cultural landmarks.\n` +
        `• **Nearby Stays & Dining**: Handpicked boutique hotels and local dining hot spots.\n` +
        `• **Cost & Budget**: Transparent expense breakdowns.\n\n` +
        `Feel free to ask me anything specific—such as *"What is the 3-day budget itinerary?"*, *"Where to eat authentic local street food?"*, or *"Is public transit safe at night?"*`;
    }

    res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Nearby Places (Hotels & Restaurants) Endpoint
app.get('/api/places/nearby', async (req, res) => {
  try {
    const { city = 'Tokyo', type = 'all' } = req.query;
    const cityData = await fetchOnlineDestinationIntelligence(city, 'Origin', 5, 'Moderate', 'Culture');

    const hotels = cityData.hotels || [];
    const restaurants = cityData.restaurants || [];
    const places = cityData.places || [];

    if (type === 'hotels') {
      return res.json({ success: true, hotels });
    }
    if (type === 'restaurants') {
      return res.json({ success: true, restaurants });
    }
    if (type === 'places' || type === 'attractions') {
      return res.json({ success: true, places });
    }

    res.json({ success: true, hotels, restaurants, places });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Online Traveler Reviews Endpoint
app.get('/api/reviews', (req, res) => {
  try {
    const { destination = 'Tokyo' } = req.query;
    const destLower = String(destination).trim().toLowerCase();
    let cityData = null;

    for (const [k, v] of Object.entries(GLOBAL_CITY_INTELLIGENCE)) {
      if (destLower.includes(k) || k.includes(destLower)) {
        cityData = v;
        break;
      }
    }

    if (!cityData) {
      cityData = {
        rating: 4.92,
        reviewsCount: 1250,
        safetyScore: 9.6,
        reviews: [
          { author: 'Rahul Mehta', location: 'Ahmedabad, India', rating: 5, date: '3 days ago', text: `${destination} is an absolute must-visit! The ropeway experience and serene hill views made it an unforgettable journey.`, verified: true },
          { author: 'Sneha Patel', location: 'Mumbai, India', rating: 5, date: '1 week ago', text: `Incredible spiritual energy and stunning landscapes. Clean facilities and authentic local food stalls near the foothills!`, verified: true },
        ],
      };
    }

    res.json({
      success: true,
      destination,
      rating: cityData.rating || 4.92,
      reviewsCount: 3840,
      safetyScore: cityData.safetyScore || 9.6,
      reviews: cityData.reviews || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 GlobeTrotter Backend + Prisma DB running on http://localhost:${PORT}`);
  });
}

module.exports = app;
