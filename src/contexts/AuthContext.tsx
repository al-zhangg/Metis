import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { UserProfile } from '../services/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
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
  const { 
    user: auth0User, 
    isAuthenticated: auth0IsAuthenticated, 
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (auth0Loading) return;
      
      if (auth0IsAuthenticated && auth0User) {
        try {
          // Try to get existing user profile
          let userProfile = await getUserProfile(auth0User.sub!);
          
          // If user doesn't exist, create new profile with defaults
          if (!userProfile) {
            userProfile = await createUserProfile(auth0User);
          }
          
          setUser(userProfile);
        } catch (error) {
          console.error('Error initializing user:', error);
          // Create fallback user profile
          const fallbackProfile: UserProfile = {
            id: auth0User.sub!,
            username: auth0User.name || auth0User.email?.split('@')[0] || 'User',
            email: auth0User.email || '',
            current_xp: 0,
            level: 1,
            total_habits: 0,
            achievements: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(fallbackProfile);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeUser();
  }, [auth0IsAuthenticated, auth0User, auth0Loading]);

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }
      
      return data;
    }
    
    // Mock storage for development
    const stored = localStorage.getItem(`metis_profile_${userId}`);
    return stored ? JSON.parse(stored) : null;
  };

  const createUserProfile = async (auth0User: any): Promise<UserProfile> => {
    const newProfile: UserProfile = {
      id: auth0User.sub,
      username: auth0User.name || auth0User.email?.split('@')[0] || 'User',
      email: auth0User.email || '',
      current_xp: 0,
      level: 1,
      total_habits: 0,
      achievements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    // Mock storage for development
    localStorage.setItem(`metis_profile_${auth0User.sub}`, JSON.stringify(newProfile));
    return newProfile;
  };

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
    setUser(null);
    // Clear local storage
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading: loading || auth0Loading,
      isAuthenticated: auth0IsAuthenticated && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};