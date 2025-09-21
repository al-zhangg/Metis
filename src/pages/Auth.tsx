import React from 'react';
import { Navigate } from 'react-router-dom';
import { Crown, Sparkles, Shield, Scroll, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

/**
 * Simplified production-ready Auth page.
 * - Keeps loading state, error display, login button, and UI.
 * - Removes development/debug instructions and environment checks.
 */
const Auth: React.FC = () => {
  const { user, login, loading, error } = useAuth();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

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

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src="/images/metis_logo.svg"
              alt="Greek Temple"
              className="w-24 h-24 rounded-half object-cover mx-auto mb-4 border-4 border-slate-300 shadow-lg"
            />
          </div>
          <h1 className="font-cinzel font-bold text-4xl text-slate-800 mb-2">Metis</h1>
          <p className="font-inter text-slate-600 mb-6">Godlike productivity, gamified.</p>

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
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Scroll className="w-6 h-6 text-rose-600" />
              </div>
              <p className="font-inter text-xs text-slate-600">Oracle Journal</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-6">
            <LogIn className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="font-cinzel font-semibold text-2xl text-slate-800 mb-2">Log In</h2>
            <p className="font-inter text-slate-600">Begin your journey of self-improvement.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-inter text-sm text-red-600">
                <strong>Authentication Error:</strong>
                <br />
                {error}
              </p>
            </div>
          )}

          <Button text="Sign In / Create Account" onClick={login} variant="primary" className="w-full mb-4" />

          <div className="mt-3 text-center">
            <p className="font-inter text-xs text-slate-500">🔒 Secure authentication powered by Auth0</p>
            <p className="font-inter text-xs text-slate-400 mt-2">Callback URL to add in Auth0:</p>
            <code className="block bg-white px-2 py-1 rounded text-xs break-all mt-1">{currentOrigin}</code>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="font-inter text-sm text-slate-500">⚱️ Wisdom through discipline • Strength through consistency ⚱️</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
