import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, BookOpen, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/add-habit', label: 'Add Habit', icon: Plus },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-marble border-b-2 border-bronze shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="font-cinzel font-bold text-xl text-midnight-blue">
              Metis
            </h1>
            <span className="ml-2 text-bronze">⚱️</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md font-inter font-medium
                    transition-all duration-200 hover:scale-105
                    ${
                      isActive
                        ? 'text-bronze border-b-2 border-bronze'
                        : 'text-gray-600 hover:text-bronze hover:bg-bronze/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;