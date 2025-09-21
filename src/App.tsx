import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { enhancedApi } from './services/enhancedApi';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import AddHabit from './pages/AddHabit';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

const AppContent: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Set current user in API service when user changes
  React.useEffect(() => {
    if (user) {
      enhancedApi.setCurrentUser(user);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marble via-slate-mist to-olympus-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aegean-blue mx-auto mb-4"></div>
          <p className="font-inter text-storm-gray">Loading your wisdom...</p>
        </div>
      </div>
    );
  }

  // Always render routes. Use ProtectedRoute for authenticated pages.
  return (
    <div className="min-h-screen bg-gradient-to-br from-marble via-slate-mist to-olympus-white">
      {isAuthenticated && user && <Navigation />}
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-habit"
          element={
            <ProtectedRoute>
              <AddHabit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
