import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { enhancedApi } from '../services/enhancedApi';
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
  
  // Get the current origin and ensure it's properly formatted
  const currentOrigin = window.location.origin;
  const redirectUri = currentOrigin;
  
  // Check if we're in WebContainer environment
  const isWebContainer = window.location.hostname.includes('webcontainer-api.io');
  const isCodespaces = window.location.hostname.includes('github.dev') || window.location.hostname.includes('codespaces');
  const isLocalhost = window.location.hostname === 'localhost';
  
  console.log('🔐 Auth0 Environment Check:', {
    domain: domain || '❌ MISSING',
    clientId: clientId ? '✅ SET' : '❌ MISSING',
    redirectUri: redirectUri,
    currentOrigin: currentOrigin,
    environment: isWebContainer ? 'WebContainer' : isCodespaces ? 'Codespaces' : isLocalhost ? 'Localhost' : 'Unknown',
    hostname: window.location.hostname
  });

  const isAuth0Configured = domain && clientId && domain.includes('auth0.com');

  if (!isAuth0Configured) {
    const errorMsg = `Auth0 not configured. Add these URLs to your Auth0 app settings:
    
Callback URLs: ${currentOrigin}
Web Origins: ${currentOrigin}  
Logout URLs: ${currentOrigin}

Current environment: ${isWebContainer ? 'WebContainer' : isCodespaces ? 'Codespaces' : 'Localhost'}`;
    
    console.error('❌ Auth0 Configuration Invalid:', errorMsg);
    return <AuthProviderContent isConfigured={false}>{children}</AuthProviderContent>;
  }

  console.log('✅ Auth0 Configuration Valid - Initializing Provider');

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email",
        audience: undefined
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      skipRedirectCallback={window.location.pathname === '/auth'}
      onRedirectCallback={(appState) => {
        try {
          console.log('🔄 Auth0 Redirect Callback:', appState);
          const returnTo = (appState as any)?.returnTo || window.location.pathname || '/dashboard';
          
          // Clean up the URL by removing Auth0 parameters
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          
          // Navigate to the return URL
          window.history.replaceState({}, document.title, returnTo);
        } catch (err) {
          console.error('Error during onRedirectCallback navigation:', err);
          window.history.replaceState({}, document.title, '/dashboard');
        }
      }}
      onError={(error) => {
        console.error('🚨 Auth0 Error:', error);
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
  const [error, setError] = useState<string | null>(null);
  
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

  // console.log('🔍 Auth Debug Info:', debugInfo); // Disabled for production

  useEffect(() => {
    // console.log('🔄 Auth Effect Running:', { isConfigured, auth0Loading, auth0IsAuthenticated });

    if (!isConfigured) {
      setError('Auth0 not configured properly');
      setLoading(false);
      return;
    }
    
    if (auth0Error) {
      console.error('Auth0 Error:', auth0Error);
      setError(auth0Error.message);
      setLoading(false);
      return;
    }

    const initializeUser = async () => {
      if (auth0Loading) {
        // Still loading, wait for Auth0
        return;
      }
      
      if (auth0IsAuthenticated && auth0User) {
        try {
          setError(null);
          
          // Set current user in enhanced API
          enhancedApi.setCurrentUser(auth0User);
          
          // Try to get existing user profile via enhancedApi
          let userProfile = await enhancedApi.getUserProfile();

          // If user doesn't exist, create new profile with defaults via enhancedApi
          if (!userProfile) {
            const newProfile = {
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
            userProfile = await enhancedApi.upsertUserProfile(newProfile as any);
          }
          
          // Update last login time
          if (isSupabaseConfigured() && supabase && userProfile) {
            await supabase
              .from('user_profiles')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', userProfile.id);
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
        // User not authenticated, show login page
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeUser();
  }, [auth0IsAuthenticated, auth0User, auth0Loading, auth0Error, isConfigured]);

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('Supabase getUserProfile error:', error);
        return null;
      }
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
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Supabase createUserProfile error:', error);
        // Fall back to mock storage
        localStorage.setItem(`metis_profile_${auth0User.sub}`, JSON.stringify(newProfile));
        return newProfile;
      }
    }
    
    // Mock storage for development
    localStorage.setItem(`metis_profile_${auth0User.sub}`, JSON.stringify(newProfile));
    return newProfile;
  };

  const login = async () => {
    if (!isConfigured) {
      console.error('Cannot login - Auth0 not configured');
      setError('Auth0 not configured properly');
      return;
    }

    try {
      setError(null);
      console.log('🚀 Initiating Auth0 login...');
      await loginWithRedirect({ 
        appState: { returnTo: '/dashboard' },
        authorizationParams: {
          redirect_uri: window.location.origin,
          scope: 'openid profile email'
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    }
  };

  const logout = () => {
    if (!isConfigured) {
      console.error('Cannot logout - Auth0 not configured');
      return;
    }

    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
    // Clear local auth state but preserve per-user app data in localStorage
    setUser(null);
    setError(null);
    // Tell enhanced API there is no current user (it will switch to anonymous cache)
    try {
      enhancedApi.setCurrentUser(null);
    } catch (err) {
      console.warn('Failed to clear enhancedApi user on logout:', err);
    }
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
