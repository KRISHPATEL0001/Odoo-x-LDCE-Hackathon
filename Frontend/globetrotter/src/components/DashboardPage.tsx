import React, { useState } from 'react';
import { UserProfile, DashboardTab, Trip, Destination } from '../types.ts';
import { INITIAL_TRIPS, FEATURED_DESTINATIONS } from '../data/mockData.ts';
import { Sidebar } from './dashboard/Sidebar.tsx';
import { TopNavBar } from './dashboard/TopNavBar.tsx';
import { DashboardHero } from './dashboard/DashboardHero.tsx';
import { StatsOverview } from './dashboard/StatsOverview.tsx';
import { UpcomingTripsSection } from './dashboard/UpcomingTripsSection.tsx';
import { BrowseDestinationsView } from './dashboard/BrowseDestinationsView.tsx';
import { ItineraryPlannerView } from './dashboard/ItineraryPlannerView.tsx';
import { BudgetPlannerView } from './dashboard/BudgetPlannerView.tsx';
import { ActivitySuggestionsView } from './dashboard/ActivitySuggestionsView.tsx';
import { TripHistoryView } from './dashboard/TripHistoryView.tsx';
import { SavedTripsView } from './dashboard/SavedTripsView.tsx';
import { ProfileSettingsView } from './dashboard/ProfileSettingsView.tsx';
import { CreateTripModal } from './dashboard/CreateTripModal.tsx';

interface DashboardPageProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [currency, setCurrency] = useState('₹');

  // Interactive app state
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [destinations, setDestinations] = useState<Destination[]>(FEATURED_DESTINATIONS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(user);

  // Modals and selections
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [prefillDestination, setPrefillDestination] = useState<Destination | null>(null);
  const [selectedTripForItinerary, setSelectedTripForItinerary] = useState<string | undefined>(undefined);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleToggleSaveDestination = (destId: string) => {
    setDestinations((prev) =>
      prev.map((d) => (d.id === destId ? { ...d, isSaved: !d.isSaved } : d))
    );
    showToast('Wishlist updated!');
  };

  const handlePlanForDestination = (dest: Destination) => {
    setPrefillDestination(dest);
    setIsCreateTripOpen(true);
  };

  const handleCreateTrip = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
    showToast(`Trip to ${newTrip.destination} created!`);
    setCurrentTab('itinerary-planner');
    setSelectedTripForItinerary(newTrip.id);
  };

  const handleSelectTripFromUpcoming = (trip: Trip) => {
    setSelectedTripForItinerary(trip.id);
    setCurrentTab('itinerary-planner');
  };

  const handleHeroSearch = (query: string) => {
    setCatalogSearchTerm(query);
    setCurrentTab('browse-destinations');
  };

  const handleHeroSelectPopular = (tag: string) => {
    setCatalogSearchTerm(tag);
    setCurrentTab('browse-destinations');
  };

  const handleAddActivitySuggestion = (activityTitle: string) => {
    showToast(`Added "${activityTitle}" to itinerary!`);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updated });
    }
  };

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const savedDestinations = destinations.filter((d) => d.isSaved);
  const totalSpentAcrossAll = trips.reduce((acc, t) => acc + (t.spent || 0), 0);

  const userName = currentUser?.name || 'Krish Patel';

  return (
    <div className="flex h-screen bg-[#fdfcf8] text-[#333533] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenCreateTrip={() => {
          setPrefillDestination(null);
          setIsCreateTripOpen(true);
        }}
        onLogout={onLogout}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavBar
          user={currentUser}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          onSearch={handleHeroSearch}
          onLogout={onLogout}
          onOpenProfile={() => setCurrentTab('profile')}
          onOpenSettings={() => setCurrentTab('settings')}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto">
            {/* Toast feedback banner */}
            {toastMessage && (
              <div className="mb-4 p-3.5 bg-[#5d6d5a] text-[#fdfcf8] rounded-2xl text-xs font-semibold shadow-md flex items-center justify-between animate-in fade-in duration-150">
                <span>{toastMessage}</span>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="text-white/80 hover:text-white ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Render active view based on tab */}
            {currentTab === 'dashboard' && (
              <div>
                {/* 1. Welcome Hero Banner matching screenshot */}
                <DashboardHero
                  userName={userName}
                  onSearch={handleHeroSearch}
                  onSelectPopular={handleHeroSelectPopular}
                />

                {/* 2. 4 Stat Cards matching screenshot */}
                <StatsOverview
                  upcomingCount={upcomingTrips.length}
                  completedCount={completedTrips.length}
                  destinationsCount={18}
                  totalSpent={totalSpentAcrossAll || 45230}
                  currency={currency}
                  onNavigate={(tab) => setCurrentTab(tab)}
                />

                {/* 3. Your Upcoming Trips section matching screenshot */}
                <UpcomingTripsSection
                  trips={trips}
                  onSelectTrip={handleSelectTripFromUpcoming}
                  onViewAll={() => setCurrentTab('upcoming-trips')}
                  onAddNewTrip={() => {
                    setPrefillDestination(null);
                    setIsCreateTripOpen(true);
                  }}
                />
              </div>
            )}

            {currentTab === 'browse-destinations' && (
              <BrowseDestinationsView
                destinations={destinations}
                onToggleSave={handleToggleSaveDestination}
                onPlanForDestination={handlePlanForDestination}
                initialSearch={catalogSearchTerm}
                currency={currency}
              />
            )}

            {currentTab === 'itinerary-planner' && (
              <ItineraryPlannerView
                trips={trips}
                selectedTripId={selectedTripForItinerary}
                currency={currency}
              />
            )}

            {currentTab === 'budget-planner' && (
              <BudgetPlannerView
                trips={trips}
                currency={currency}
                onChangeCurrency={(curr) => setCurrency(curr)}
              />
            )}

            {currentTab === 'activity-suggestions' && (
              <ActivitySuggestionsView
                currency={currency}
                onAddActivityToTrip={handleAddActivitySuggestion}
              />
            )}

            {currentTab === 'trip-history' && (
              <TripHistoryView
                trips={trips}
                currency={currency}
                onPlanAgain={(trip) => {
                  setPrefillDestination({
                    id: `dest-${trip.id}`,
                    name: trip.destination,
                    country: trip.country,
                    flag: trip.flag,
                    image: trip.coverImage,
                    rating: 4.9,
                    reviewsCount: 120,
                    avgCostPerDay: 5000,
                    bestMonths: 'Year-round',
                    description: trip.notes || 'Revisit this dream destination.',
                    category: 'cultural',
                    highlights: ['Local culture', 'Scenic spots'],
                    isSaved: true,
                  });
                  setIsCreateTripOpen(true);
                }}
              />
            )}

            {currentTab === 'upcoming-trips' && (
              <div className="space-y-6">
                <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
                      All Upcoming Journeys ({upcomingTrips.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1">
                      Full view of your scheduled departures and itinerary readiness.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPrefillDestination(null);
                      setIsCreateTripOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    + New Trip
                  </button>
                </div>

                <UpcomingTripsSection
                  trips={trips}
                  onSelectTrip={handleSelectTripFromUpcoming}
                  onViewAll={() => {}}
                  onAddNewTrip={() => {
                    setPrefillDestination(null);
                    setIsCreateTripOpen(true);
                  }}
                />
              </div>
            )}

            {currentTab === 'saved-trips' && (
              <SavedTripsView
                savedDestinations={savedDestinations}
                onRemoveSaved={handleToggleSaveDestination}
                onPlanTrip={handlePlanForDestination}
                currency={currency}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileSettingsView
                user={currentUser}
                onUpdateProfile={handleUpdateProfile}
                activeSubSection="profile"
              />
            )}

            {currentTab === 'settings' && (
              <ProfileSettingsView
                user={currentUser}
                onUpdateProfile={handleUpdateProfile}
                activeSubSection="settings"
              />
            )}

            {currentTab === 'help' && (
              <ProfileSettingsView
                user={currentUser}
                onUpdateProfile={handleUpdateProfile}
                activeSubSection="help"
              />
            )}
          </div>
        </main>
      </div>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => {
          setIsCreateTripOpen(false);
          setPrefillDestination(null);
        }}
        onCreateTrip={handleCreateTrip}
        prefillDestination={prefillDestination}
        currency={currency}
      />
    </div>
  );
};
