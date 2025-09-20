import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { UserProfile } from '../services/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  debugInfo: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth0 Wrapper Component
const Auth0Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
  
  console.log('🔐 Auth0 Environment Variables:', {
    domain: domain || '❌ MISSING',
    clientId: clientId ? '✅ SET' : '❌ MISSING',
    domainValid: domain.includes('auth0.com'),
    clientIdLength: clientId.length
  });

  const isAuth0Configured = domain && clientId && domain.includes('auth0.com');

  if (!isAuth0Configured) {
    console.error('❌ Auth0 Configuration Invalid:', {
      domain: domain || 'MISSING',
      clientId: clientId ? 'Present but invalid' : 'MISSING',
      help: 'Check your .env file'
    });
    return <AuthProviderContent isConfigured={false}>{children}</AuthProviderContent>;
  }

  console.log('✅ Auth0 Configuration Valid - Initializing Provider');

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      onRedirectCallback={(appState) => {
        console.log('🔄 Auth0 Redirect Callback:', appState);
      }}
    >
      <AuthProviderContent isConfigured={true}>{children}</AuthProviderContent>
    </Auth0Provider>
  );
};

// Main Auth Provider Content
const AuthProviderContent: React.FC<{ 
  children: React.ReactNode; 
  isConfigured: boolean;
}> = ({ children, isConfigured }) => {
  const auth0Hook = isConfigured ? useAuth0() : {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: () => {
      console.error('❌ Auth0 not configured - cannot login');
      return Promise.resolve();
    },
    logout: () => {
      console.error('❌ Auth0 not configured - cannot logout');
    },
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
  // Debug information
  const debugInfo = {
    isConfigured,
    auth0User: auth0User ? 'Present' : 'None',
    auth0IsAuthenticated,
    auth0Loading,
    auth0Error: auth0Error?.message || 'None',
    userProfile: user ? 'Present' : 'None',
    domain: import.meta.env.VITE_AUTH0_DOMAIN || 'Missing',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ? 'Set' : 'Missing',
    currentUrl: window.location.origin,
    redirectUri: window.location.origin
  };

  console.log('🔍 Auth Debug Info:', debugInfo);

  useEffect(() => {
    console.log('🔄 Auth Effect Running:', {
      isConfigured,
      auth0Loading,
      auth0IsAuthenticated,
      auth0User: auth0User ? 'Present' : 'None',
      auth0Error: auth0Error?.message || 'None'
    });

    if (!isConfigured) {
      setError('Auth0 not configured properly');
      setLoading(false);
      return;
    }
    
    if (auth0Error) {
      console.error('❌ Auth0 Error:', auth0Error);
      setError(auth0Error.message);
      setLoading(false);
      return;
    }

    const initializeUser = async () => {
      if (auth0Loading) {
        console.log('⏳ Auth0 still loading...');
        return;
      }
      
      if (auth0IsAuthenticated && auth0User) {
        console.log('✅ User authenticated:', auth0User);
        try {
          setError(null);
          // Try to get existing user profile
          let userProfile = await getUserProfile(auth0User.sub!);
          
          // If user doesn't exist, create new profile with defaults
          if (!userProfile) {
            console.log('👤 Creating new user profile...');
            userProfile = await createUserProfile(auth0User);
          }
          
          console.log('✅ User profile loaded:', userProfile);
          setUser(userProfile);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user';
          console.error('❌ Error initializing user:', errorMessage);
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
        console.log('❌ User not authenticated');
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeUser();
  }, [auth0IsAuthenticated, auth0User, auth0Loading, auth0Error, isConfigured]);

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
    console.log('🔐 Login attempt...');
    if (!isConfigured) {
      console.error('❌ Cannot login - Auth0 not configured');
      setError('Auth0 not configured properly');
      return;
    }

    try {
      setError(null);
      console.log('🚀 Calling Auth0 loginWithRedirect...');
      await loginWithRedirect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login error:', errorMessage);
      setError(errorMessage);
    }
  };

  const logout = () => {
    console.log('🚪 Logout attempt...');
    if (!isConfigured) {
      console.error('❌ Cannot logout - Auth0 not configured');
      return;
    }

    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
    setUser(null);
    setError(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading: loading || auth0Loading,
      isAuthenticated: auth0IsAuthenticated && !!user,
      error,
      debugInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Auth0Wrapper>
      {children}
    </Auth0Wrapper>
  );
};