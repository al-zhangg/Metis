import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Crown, Sparkles, Shield, Scroll } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Auth: React.FC = () => {
  const { user, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isLogin 
        ? await login(formData.email, formData.password)
        : await signup(formData.username, formData.email, formData.password);

      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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

        {/* Auth Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-inter font-medium transition-all duration-200 ${
                isLogin 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-inter font-medium transition-all duration-200 ${
                !isLogin 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block font-inter font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-inter transition-colors"
                  placeholder="Choose your hero name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block font-inter font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-inter transition-colors"
                placeholder="your.email@olympus.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-inter font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-inter transition-colors"
                placeholder="Enter your secret"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-inter text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              text={loading ? "Authenticating..." : (isLogin ? "Enter the Realm" : "Begin Your Journey")}
              onClick={() => {}}
              variant="primary"
              disabled={loading}
              className="w-full"
            />
          </form>

          <div className="mt-6 text-center">
            <p className="font-inter text-sm text-slate-500">
              {isLogin ? "New to Metis?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>
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