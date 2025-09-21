import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Trophy, Crown } from 'lucide-react';
import XPBar from '../components/XPBar';
import Card from '../components/Card';
import { enhancedApi } from '../services/enhancedApi';
import type { UserProfile } from '../services/supabaseClient';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { user: authUserProfile, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // If AuthContext is still initializing, wait for it
        if (authLoading) return;

        // If AuthContext already has the profile, use it
        if (isAuthenticated && authUserProfile) {
          if (!cancelled) setProfile(authUserProfile);
          return;
        }

        // Otherwise attempt to fetch from the API
        const profileData = await enhancedApi.getUserProfile();
        if (!cancelled) setProfile(profileData);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, authLoading, isAuthenticated, authUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marble to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze mx-auto mb-4"></div>
          <p className="font-inter text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marble to-amber-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-bronze/20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="font-cinzel font-bold text-2xl text-midnight-blue mb-4">
              Profile Not Available
            </h2>
            <p className="font-inter text-gray-600 mb-4">
              Unable to load your profile. This might be due to authentication issues.
            </p>
            <p className="font-inter text-sm text-gray-500">
              Try refreshing the page or logging out and back in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marble to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-bronze/20 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-bronze to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-laurel-green rounded-full flex items-center justify-center shadow-md">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="font-cinzel font-bold text-3xl text-midnight-blue mb-2">
                {profile.username}
              </h1>
              <p className="font-inter text-gray-600 mb-4">
                Ancient Wisdom Seeker • Level {profile.level}
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-marble rounded-lg p-3">
                  <div className="font-cinzel font-semibold text-2xl text-bronze">
                    {profile.total_habits}
                  </div>
                  <div className="font-inter text-sm text-gray-600">
                    Habits Forged
                  </div>
                </div>
                <div className="bg-marble rounded-lg p-3">
                  <div className="font-cinzel font-semibold text-2xl text-bronze">
                    {profile.achievements.length}
                  </div>
                  <div className="font-inter text-sm text-gray-600">
                    Achievements
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <XPBar
            currentXP={profile.current_xp}
            maxXP={2000}
            level={profile.level}
          />
        </div>

        {/* Achievements Section */}
        <div>
          <h2 className="font-cinzel font-semibold text-2xl text-midnight-blue mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-bronze" />
            Unlocked Achievements
          </h2>
          
          {profile.achievements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="font-inter text-gray-600">
                Begin your journey to unlock divine achievements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.achievements.map(achievement => (
                <Card
                  key={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.icon}
                  status="completed"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-sm text-gray-600">
                      Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </span>
                    <div className="w-3 h-3 bg-laurel-green rounded-full animate-pulse"></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-bronze/20 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="font-cinzel font-semibold text-xl text-midnight-blue mb-1">
              Divine Energy
            </div>
            <div className="font-inter text-2xl text-bronze font-bold">
              {Math.floor(profile.current_xp / 10)}%
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-bronze/20 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-cinzel font-semibold text-xl text-midnight-blue mb-1">
              Focus Level
            </div>
            <div className="font-inter text-2xl text-bronze font-bold">
              Master
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-bronze/20 text-center">
            <div className="text-4xl mb-2">🔮</div>
            <div className="font-cinzel font-semibold text-xl text-midnight-blue mb-1">
              Wisdom Rank
            </div>
            <div className="font-inter text-2xl text-bronze font-bold">
              Sage
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;