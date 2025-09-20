import React from 'react';
import { Navigate } from 'react-router-dom';
import { Crown, Sparkles, Shield, Scroll, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Auth: React.FC = () => {
  const { user, login, loading, error, debugInfo } = useAuth();

  // Check Auth0 configuration
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const isAuth0Configured = domain && clientId && domain.includes('auth0.com');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="font-inter text-slate-600">Connecting to the Oracle...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    console.log('🔐 Login button clicked');
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-slate-200/40 rounded-full blur-lg"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img 
              src="https://images.pexels.com/photos/8828489/pexels-photo-8828489.jpeg?auto=compress&cs=tinysrgb&w=400" 
              alt="Greek Temple"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-slate-300 shadow-lg"
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="font-cinzel font-bold text-4xl text-slate-800 mb-2">
            Metis
          </h1>
          <p className="font-inter text-slate-600 mb-6">
            Ancient Wisdom • Modern Habits
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-inter text-xs text-slate-600">AI Wisdom</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="font-inter text-xs text-slate-600">Epic Quests</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Scroll className="w-6 h-6 text-slate-600" />
              </div>
              <p className="font-inter text-xs text-slate-600">Oracle Journal</p>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-6">
            <LogIn className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="font-cinzel font-semibold text-2xl text-slate-800 mb-2">
              Enter the Realm
            </h2>
            <p className="font-inter text-slate-600">
              Sign in with your secure Auth0 account to begin your journey of wisdom and self-improvement.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-inter text-sm text-red-600">
                <strong>Authentication Error:</strong><br/>
                {error}
              </p>
            </div>
          )}


          {/* Development Notice */}
          {!isAuth0Configured && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-inter text-sm text-yellow-800">
                <strong>⚠️ Configuration Required:</strong><br/>
                Domain: {domain || '❌ Missing'}<br/>
                Client ID: {clientId ? '✅ Set' : '❌ Missing'}<br/>
                <br/>
                Please check your .env file and restart the server.
              </p>
            </div>
          )}

          <Button
            text={isAuth0Configured ? "Sign In / Create Account" : "⚠️ Auth0 Not Configured"}
            onClick={handleLogin}
            variant="primary"
            className="w-full mb-4"
            disabled={!isAuth0Configured}
          />

          {/* Current URL Info for Auth0 Setup */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-inter text-sm text-blue-800">
              <strong>📋 For Auth0 Setup:</strong><br/>
              Add this URL to your Auth0 "Allowed Callback URLs":<br/>
              <code className="bg-white px-2 py-1 rounded text-xs break-all">
                {window.location.origin}
              </code>
            </p>
          </div>

          <div className="text-center">
            <p className="font-inter text-xs text-slate-500">
              {isAuth0Configured ? 
                "🔒 Secure authentication powered by Auth0" : 
                "🔧 Please configure Auth0 credentials"
              }
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
          <h3 className="font-cinzel font-semibold text-lg text-slate-800 mb-3">
            New User Benefits:
          </h3>
          <ul className="space-y-2 font-inter text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Start at Level 1 with 0 XP
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Clean slate for habit tracking
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              Personalized Oracle journal
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Achievement system unlocked
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="font-inter text-sm text-slate-500">
            ⚱️ Wisdom through discipline • Strength through consistency ⚱️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;