import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, BookOpen, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/add-habit', icon: Plus, label: 'Add Habit' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-aegean-blue/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-aegean-blue to-deep-aegean rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-cinzel font-bold text-lg">M</span>
            </div>
            <span className="font-cinzel font-bold text-xl text-midnight">
              Metis
            </span>
          </Link>

          {/* Navigation items */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-medium
                  transition-all duration-200 hover:scale-105
                  ${location.pathname === path
                    ? 'bg-aegean-blue text-white shadow-md'
                    : 'text-storm-gray hover:bg-slate-mist hover:text-midnight'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-medium
                       text-storm-gray hover:bg-red-50 hover:text-red-600
                       transition-all duration-200 hover:scale-105 ml-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;