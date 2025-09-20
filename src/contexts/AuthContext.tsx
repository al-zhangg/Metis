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
  error: string | null;
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
  // Check if Auth0 is properly configured
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const isAuth0Configured = domain && clientId && domain.includes('auth0.com');
  
  const auth0Hook = isAuth0Configured ? useAuth0() : {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: () => Promise.resolve(),
    logout: () => {},
    error: null
  };
  
  const { 
    user: auth0User, 
    isAuthenticated: auth0IsAuthenticated, 
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    error: auth0Error
  } = auth0Hook;
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    !isAuth0Configured ? 'Auth0 not configured properly' : null
  );

  useEffect(() => {
    if (!isAuth0Configured) {
      setLoading(false);
      return;
    }
    
    if (auth0Error) {
      setError(auth0Error.message);
      setLoading(false);
      return;
    }

    const initializeUser = async () => {
      if (auth0Loading) return;
      
      if (auth0IsAuthenticated && auth0User) {
        try {
          setError(null);
          // Try to get existing user profile
          let userProfile = await getUserProfile(auth0User.sub!);
          
          // If user doesn't exist, create new profile with defaults
          if (!userProfile) {
            userProfile = await createUserProfile(auth0User);
          }
          
          setUser(userProfile);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user';
          console.error('Error initializing user:', errorMessage);
          setError(errorMessage);
          
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
  }, [auth0IsAuthenticated, auth0User, auth0Loading, auth0Error, isAuth0Configured]);

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

  const login = async () => {
    try {
      setError(null);
      await loginWithRedirect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
    }
  };

  const logout = () => {
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
    setUser(null);
    setError(null);
    // Clear local storage
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading: loading || auth0Loading,
      isAuthenticated: auth0IsAuthenticated && !!user,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};