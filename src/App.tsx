import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import AddHabit from './pages/AddHabit';
import Journal from './pages/Journal';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-marble">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-habit" element={<AddHabit />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;