import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSystemThemeListener } from './stores/themeStore';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { ApiErrorBoundary } from './components/ApiErrorBoundary';

// Import pages (will create these next)
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TechnicianMobileApp from './pages/technician/TechnicianMobileApp';
import PublicRatingForm from './pages/PublicRatingForm';
import PublicLeaderboard from './pages/public/PublicLeaderboard';

function App() {
  // Initialize theme system
  useSystemThemeListener();
  
  return (
    <ApiErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-black font-system">
            <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route path="/rate/:token" element={<PublicRatingForm />} />
            <Route path="/public/leaderboard" element={<PublicLeaderboard />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Technician Routes */}
            <Route
              path="/technician/*"
              element={
                <ProtectedRoute requiredRole="technician">
                  <TechnicianMobileApp />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to appropriate dashboard */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ApiErrorBoundary>
  );
}

export default App;
