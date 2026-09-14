import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPageV3'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import TouristDashboard from './pages/TouristDashboard'
import BusinessDashboard from './pages/BusinessDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UsersPage from './pages/UsersPage'
import ListingsPage from './pages/ListingsPage'
import BookingsPage from './pages/BookingsPage'
import AdminBusinessesPage from './pages/AdminBusinessesPage'
import AdminPromotionsPage from './pages/AdminPromotionsPage'
import AdminLocalGuidesPage from './pages/AdminLocalGuidesPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import OnboardingQuiz from './pages/OnboardingQuiz'
import ItineraryBuilder from './pages/ItineraryBuilder'
import BusinessListingsPage from './pages/BusinessListingsPage'
import BusinessPromotionsPage from './pages/BusinessPromotionsPage'
import BusinessMessagesPage from './pages/BusinessMessagesPage'
import BusinessBookingsPage from './pages/BusinessBookingsPage'
import BusinessEarningsPage from './pages/BusinessEarningsPage'
import BusinessReviewsPage from './pages/BusinessReviewsPage'
import BusinessSettingsPage from './pages/BusinessSettingsPage'
import MyTripsPage from './pages/MyTripsPage'
import SavedPlacesPage from './pages/SavedPlacesPage'
import TouristBookingsPage from './pages/TouristBookingsPage'
import TouristReviewsPage from './pages/TouristReviewsPage'
import TouristFollowingPage from './pages/TouristFollowingPage'
import DestinationDetailPage from './pages/DestinationDetailPage'
import TouristSettingsPage from './pages/TouristSettingsPage'
import TouristMessagesPage from './pages/TouristMessagesPage'
import BusinessDetailPage from './pages/BusinessDetailPage'
import VideoFeedPage from './pages/VideoFeedPage'
import RequireRole from './components/RequireRole'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/quiz" element={<OnboardingQuiz />} />
        <Route path="/tourist" element={<RequireRole role="tourist"><TouristDashboard /></RequireRole>} />
        <Route path="/tourist/trips" element={<RequireRole role="tourist"><MyTripsPage /></RequireRole>} />
        <Route path="/tourist/saved" element={<RequireRole role="tourist"><SavedPlacesPage /></RequireRole>} />
        <Route path="/tourist/bookings" element={<RequireRole role="tourist"><TouristBookingsPage /></RequireRole>} />
        <Route path="/tourist/reviews" element={<RequireRole role="tourist"><TouristReviewsPage /></RequireRole>} />
        <Route path="/tourist/following" element={<RequireRole role="tourist"><TouristFollowingPage /></RequireRole>} />
        <Route path="/tourist/settings" element={<RequireRole role="tourist"><TouristSettingsPage /></RequireRole>} />
        <Route path="/tourist/messages" element={<RequireRole role="tourist"><TouristMessagesPage /></RequireRole>} />
        <Route path="/reels" element={<RequireRole role="tourist"><VideoFeedPage /></RequireRole>} />
        <Route path="/destination/:id" element={<DestinationDetailPage />} />
        <Route path="/itinerary" element={<ItineraryBuilder />} />
        <Route path="/business" element={<RequireRole role="local"><BusinessDashboard /></RequireRole>} />
        <Route path="/business/reels" element={<RequireRole role="local"><VideoFeedPage /></RequireRole>} />
        <Route path="/business/:id" element={<BusinessDetailPage />} />
        <Route path="/business/listings" element={<RequireRole role="local"><BusinessListingsPage /></RequireRole>} />
        <Route path="/business/promotions" element={<RequireRole role="local"><BusinessPromotionsPage /></RequireRole>} />
        <Route path="/business/messages" element={<RequireRole role="local"><BusinessMessagesPage /></RequireRole>} />
        <Route path="/business/bookings" element={<RequireRole role="local"><BusinessBookingsPage /></RequireRole>} />
        <Route path="/business/earnings" element={<RequireRole role="local"><BusinessEarningsPage /></RequireRole>} />
        <Route path="/business/reviews" element={<RequireRole role="local"><BusinessReviewsPage /></RequireRole>} />
        <Route path="/business/settings" element={<RequireRole role="local"><BusinessSettingsPage /></RequireRole>} />
        <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
        <Route path="/admin/users" element={<RequireRole role="admin"><UsersPage /></RequireRole>} />
        <Route path="/admin/listings" element={<RequireRole role="admin"><ListingsPage /></RequireRole>} />
        <Route path="/admin/businesses" element={<RequireRole role="admin"><AdminBusinessesPage /></RequireRole>} />
        <Route path="/admin/promotions" element={<RequireRole role="admin"><AdminPromotionsPage /></RequireRole>} />
        <Route path="/admin/local-guides" element={<RequireRole role="admin"><AdminLocalGuidesPage /></RequireRole>} />
        <Route path="/admin/bookings" element={<RequireRole role="admin"><BookingsPage /></RequireRole>} />
        <Route path="/admin/reports" element={<RequireRole role="admin"><ReportsPage /></RequireRole>} />
        <Route path="/admin/settings" element={<RequireRole role="admin"><SettingsPage /></RequireRole>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
