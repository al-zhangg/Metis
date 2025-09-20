import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  currentXP: number;
  totalStreak: number;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('metis_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock authentication - replace with real auth later
      if (email && password) {
        const mockUser: User = {
          id: `user_${Date.now()}`,
          username: email.split('@')[0],
          email,
          level: 1,
          currentXP: 0,
          totalStreak: 0,
          joinedAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem('metis_user', JSON.stringify(mockUser));
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock signup - replace with real auth later
      if (username && email && password) {
        const mockUser: User = {
          id: `user_${Date.now()}`,
          username,
          email,
          level: 1,
          currentXP: 0,
          totalStreak: 0,
          joinedAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem('metis_user', JSON.stringify(mockUser));
        return { success: true };
      }
      
      return { success: false, error: 'All fields are required' };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('metis_user');
    localStorage.removeItem('metis_daily_completions');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};