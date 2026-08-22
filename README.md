# 🌍 GlobeTrotter — AI-Powered Travel Planner

<div align="center">

**Plan. Discover. Explore. Share.**

A full-stack, AI-enhanced travel planning platform for the Odoo × LDCE Hackathon.

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20Prisma-blue)](#)
[![Database](https://img.shields.io/badge/Database-SQLite-lightblue)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Travel Assistant** | Chat-based AI for trip recommendations, activity suggestions, and itinerary generation |
| 🗺️ **Smart Destination Search** | Fuzzy-search with typo correction + worldwide Nominatim geocoding, sorted by tourism popularity |
| 📅 **Itinerary Planner** | Day-by-day trip builder with phase-based navigation for long journeys |
| 💰 **Budget Planner** | Category-wise expense tracking with live currency rates |
| 🏨 **POI Suggestions** | Real hotels, restaurants & activities per destination using Google Maps links |
| 🌤️ **Live Weather** | Open-Meteo real-time weather and 5-day forecast with packing tips |
| 📊 **Trip Dashboard** | Stats overview, upcoming/completed trips, history |
| 🔐 **Secure Auth** | Password hashing with bcryptjs, user sessions via localStorage |

---

## 🏗️ Project Structure

```
Odoo-x-LDCE-Hackathon/
├── Backend/                  # Node.js + Express + Prisma API
│   ├── index.js              # Main API server (all routes)
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Demo data seeder
│   ├── .env.example          # Environment variables template
│   └── package.json
│
├── Frontend/
│   └── globetrotter/         # React + Vite + TailwindCSS app
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/   # UI components
│       │   ├── services/     # API client
│       │   ├── types.ts      # TypeScript interfaces
│       │   └── utils/        # Helper utilities
│       └── package.json
│
├── .gitignore
├── package.json              # Root convenience scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher (`node --version`)
- **npm** v9 or higher (`npm --version`)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/KRISHPATEL0001/Odoo-x-LDCE-Hackathon.git
cd Odoo-x-LDCE-Hackathon
```

### 2. Setup Backend

```bash
cd Backend

# Copy environment template
cp .env.example .env

# Install dependencies + initialize database + seed demo data
npm run setup
```

> This runs: `npm install` → `prisma db push` (creates SQLite DB) → `prisma:seed` (adds demo data)

### 3. Run Backend

```bash
# Still inside Backend/
npm start
# Server starts at http://localhost:5000
```

### 4. Setup & Run Frontend

Open a **new terminal**:

```bash
cd Frontend/globetrotter

# Install dependencies
npm install

# Start development server
npm run dev
# App opens at http://localhost:5173
```

### 5. Open in Browser

Navigate to **http://localhost:5173**

**Demo Account** (pre-seeded):
- **Email:** `julianna@explore.com`
- **Password:** `Wanderlust#2026`

Or register your own account!

---

## 🔑 Environment Variables

### Backend (`Backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite DB path |
| `PORT` | `5000` | Server port |
| `FRONTEND_URL` | *(not set)* | Frontend URL for CORS in production |
| `NODE_ENV` | `development` | Node environment |

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET/PUT | `/api/auth/profile` | Get/update profile |
| GET | `/api/trips` | List user trips |
| POST | `/api/trips` | Create trip |
| DELETE | `/api/trips/:id` | Delete trip |
| GET | `/api/trips/:id/activities` | Get trip activities |
| POST | `/api/trips/:id/activities` | Add activity |
| GET | `/api/places/search?q=` | Fuzzy destination search |
| GET | `/api/weather?lat=&lon=` | Live weather data |
| GET | `/api/destinations` | Browse curated destinations |
| GET | `/api/ai/suggestions` | AI trip suggestions |
| GET | `/api/currency/rates` | Live currency rates |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS v4** for styling
- **Lucide React** for icons

### Backend
- **Node.js** + **Express 5**
- **Prisma ORM** with **SQLite** (`better-sqlite3`)
- **bcryptjs** for password security
- **Open-Meteo API** for weather
- **Nominatim (OSM)** for worldwide geocoding

---

## 👥 Team Members

| Name | Role |
|---|---|
| **Krushakraj Patel** | Full-stack Developer, UI/UX |
| **Jash Solanki** | Backend Developer |
| **Kishor Pawar** | Frontend Developer |
| **Meet Rana** | Database & API |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
Built with ❤️ for the <strong>Odoo × LDCE Hackathon 2026</strong>
</div>
