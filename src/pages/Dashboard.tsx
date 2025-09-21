import React, { useState, useEffect } from 'react';
import { Home, Target, Flame, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import XPBar from '../components/XPBar';
import HabitProgressAnalysis from '../components/HabitProgressAnalysis';
import { enhancedApi } from '../services/enhancedApi';
import { dailyTracker } from '../services/dailyTracker';
import { weeklyTracker } from '../services/weeklyTracker';
import { monthlyTracker } from '../services/monthlyTracker';
import { useAuth } from '../contexts/AuthContext';
import type { Habit, Quest, UserProfile } from '../services/supabaseClient';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingHabit, setCompletingHabit] = useState<number | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<number | null>(null);
  const [completingQuest, setCompletingQuest] = useState<number | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Ensure user is set in enhancedApi
  useEffect(() => {
    if (user) {
      enhancedApi.setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Dashboard: Fetching data...');
        const [habitsData, questsData, profileData] = await Promise.all([
          enhancedApi.getHabits(),
          enhancedApi.getQuests(),
          enhancedApi.getUserProfile(),
        ]);
        console.log('Dashboard: Received habits:', habitsData);
        setHabits(habitsData);
        setQuests(questsData);
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Subscribe to enhancedApi in-memory habit changes for instant UI updates
    const unsubscribe = enhancedApi.addHabitsListener((newHabits: Habit[]) => {
      console.debug('Dashboard: enhancedApi in-memory habits updated', newHabits.length);
      setHabits(newHabits);
    });
    const unsubscribeQuests = enhancedApi.addQuestsListener((newQuests) => {
      console.debug('Dashboard: quests updated', newQuests.length);
      setQuests(newQuests);
    });
    // Listen for app-level habit updates (e.g., when AddHabit creates a habit)
    const handleHabitsUpdated = (e?: Event) => {
      console.debug('Dashboard received metis:habits-updated event', e);
      fetchData();
    };
    window.addEventListener('metis:habits-updated', handleHabitsUpdated as EventListener);
    
    // Listen for visibility change to refresh dashboard when user returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      unsubscribe();
      unsubscribeQuests();
      window.removeEventListener('metis:habits-updated', handleHabitsUpdated as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const handleCompleteHabit = async (habit: Habit) => {
    const habitId = habit.id;
    const frequency = (habit.suggested_frequency || '').toLowerCase();
    const isWeekly = frequency === 'weekly';
    const isMonthly = frequency === 'monthly';

    if (isWeekly) {
      if (weeklyTracker.isCompletedThisWeek(habitId)) return;
    } else if (isMonthly) {
      if (monthlyTracker.isCompletedThisMonth(habitId)) return;
    } else {
      if (dailyTracker.isCompletedToday(habitId)) return;
    }

    setCompletingHabit(habitId);
    try {
      const marked = isWeekly
        ? weeklyTracker.markCompleted(habitId)
        : isMonthly
          ? monthlyTracker.markCompleted(habitId)
          : dailyTracker.markCompleted(habitId);

      if (marked) {
        // Compute new streak first so XP scales by streak (1.25x per consecutive event)
        const newStreak = isWeekly
          ? weeklyTracker.getStreak(habitId)
          : isMonthly
            ? monthlyTracker.getStreak(habitId)
            : dailyTracker.getStreak(habitId);

        // Base XP: daily 25, weekly 150, monthly 500; scaled by 1.25^(streak-1)
        const base = isMonthly ? 500 : isWeekly ? 150 : 25;
        const multiplier = Math.pow(1.25, Math.max(newStreak - 1, 0));
        const xp = Math.round(base * multiplier);
        await enhancedApi.addXP(xp);

        // Update streak in UI
        setHabits(prev => prev.map(h =>
          h.id === habitId ? { ...h, current_streak: newStreak } : h
        ));

        // Refresh profile to update XP/level without reloading
        const updatedProfile = await enhancedApi.getUserProfile();
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setCompletingHabit(null);
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    setDeletingHabit(habitId);
    try {
      const result = await enhancedApi.deleteHabit(habitId);
      if (result.success) {
        // refresh habits and profile
        const newHabits = await enhancedApi.getHabits();
        setHabits(newHabits);
        const updatedProfile = await enhancedApi.getUserProfile();
        setProfile(updatedProfile);
      } else {
        console.error('Failed to delete habit:', result.error);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setDeletingHabit(null);
    }
  };

  const handleCompleteQuest = async (questId: number) => {
    setCompletingQuest(questId);
    try {
      const result = await enhancedApi.completeQuest(questId);
      if (result.success) {
        // Update the quests list to reflect completion
        setQuests(prev => prev.map(quest => 
          quest.id === questId 
            ? { ...quest, status: 'completed' as const, progress: quest.total }
            : quest
        ));
        
        // Refresh profile to update XP/level without reloading
        const updatedProfile = await enhancedApi.getUserProfile();
        setProfile(updatedProfile);
      } else {
        console.error('Failed to complete quest:', result.error);
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
    } finally {
      setCompletingQuest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marble via-slate-mist to-olympus-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aegean-blue mx-auto mb-4"></div>
          <p className="font-inter text-storm-gray">Loading your wisdom...</p>
        </div>
      </div>
    );
  }

  const completedToday = habits.filter(h => {
    const freq = (h.suggested_frequency || '').toLowerCase();
    if (freq === 'weekly') return weeklyTracker.isCompletedThisWeek(h.id);
    if (freq === 'monthly') return monthlyTracker.isCompletedThisMonth(h.id);
    return dailyTracker.isCompletedToday(h.id);
  }).length;
  const totalHabits = habits.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-marble via-slate-mist to-olympus-white relative">
      {/* White tint overlay for consistency */}
      <div className="absolute inset-0 bg-white/70 z-0"></div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-64 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('public/images/hipparchus.jpg')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="font-cinzel font-bold text-4xl mb-4">
                Welcome to Your Metis Dashboard
              </h1>
              <p className="font-inter text-xl opacity-90">
                What needs to be done today?
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 -mt-16 relative z-10">
        {/* XP Progress */}
        <div className="mb-8">
          <XPBar currentXP={profile?.current_xp ?? 0} maxXP={2000} level={profile?.level ?? 1} />
        </div>

        {/* Daily Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-aegean-blue/20 shadow-lg text-center">
            {/* <div className="text-4xl mb-2">🎯</div> */}
            <div className="font-cinzel font-semibold text-xl text-midnight mb-1">
              Today's Progress
            </div>
            <div className="font-inter text-2xl text-aegean-blue font-bold">
              {completedToday}/{totalHabits}
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-aegean-blue/20 shadow-lg text-center">
            {/* <div className="text-4xl mb-2"></div> */}
            <div className="font-cinzel font-semibold text-xl text-midnight mb-1">
              Longest Streak
            </div>
            <div className="font-inter text-2xl text-aegean-blue font-bold">
              {Math.max(...habits.map(h => dailyTracker.getStreak(h.id)), 0)} days
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-aegean-blue/20 shadow-lg text-center">
            {/* <div className="text-4xl mb-2">⚡</div> */}
            <div className="font-cinzel font-semibold text-xl text-midnight mb-1">
              Divine Energy
            </div>
            <div className="font-inter text-2xl text-aegean-blue font-bold">
              {Math.round((completedToday / Math.max(totalHabits, 1)) * 100)}%
            </div>
          </div>
        </div>

        {/* Today's Habits */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-cinzel font-semibold text-2xl text-midnight flex items-center gap-2">
              <Home className="w-6 h-6 text-aegean-blue" />
              Today's Quests
            </h2>
            <Link to="/add-habit">
              <Button text="Add New Habit" onClick={() => {}} variant="secondary" />
            </Link>
          </div>
          
          {habits.length === 0 ? (
            <div className="text-center py-12">
              {/* <div className="text-6xl mb-4">🏛️</div> */}
              <p className="font-inter text-storm-gray mb-4">
                No habits yet. What must be done?
              </p>
              <Link to="/add-habit">
                <Button text="Create Your First Habit" onClick={() => {}} variant="primary" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map(habit => {
                const freq = (habit.suggested_frequency || '').toLowerCase();
                const isWeekly = freq === 'weekly';
                const isMonthly = freq === 'monthly';
                const isCompleted = isWeekly
                  ? weeklyTracker.isCompletedThisWeek(habit.id)
                  : isMonthly
                    ? monthlyTracker.isCompletedThisMonth(habit.id)
                    : dailyTracker.isCompletedToday(habit.id);
                const currentStreak = isWeekly
                  ? weeklyTracker.getStreak(habit.id)
                  : isMonthly
                    ? monthlyTracker.getStreak(habit.id)
                    : dailyTracker.getStreak(habit.id);
                const completionRate = isWeekly
                  ? weeklyTracker.getCompletionRate(habit.id, 12)
                  : isMonthly
                    ? monthlyTracker.getCompletionRate(habit.id, 12)
                    : dailyTracker.getCompletionRate(habit.id);
                
                return (
                  <div
                    key={habit.id}
                    className={`
                      relative p-6 rounded-xl border-2 shadow-lg transform transition-all duration-300
                      hover:scale-102 hover:shadow-xl backdrop-blur-sm
                      ${isCompleted ? 'border-laurel-green bg-green-50' : 'border-aegean-blue/20 bg-white'}
                    `}
                  >
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4">
                      {isCompleted ? (
                        <div className="w-3 h-3 bg-laurel-green rounded-full animate-pulse"></div>
                      ) : (
                        <div className="w-3 h-3 bg-aegean-blue rounded-full animate-glow"></div>
                      )}
                    </div>

                    {/* Card header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-white/50 border border-gray-200">
                        <img 
                          src={`/images/${habit.icon}.png`} 
                          alt={habit.icon}
                          className="w-8 h-8 object-cover"
                          onError={(e) => {
                            // Fallback to text if image fails to load
                            e.currentTarget.style.display = 'none';
                            const textFallback = document.createElement('span');
                            textFallback.textContent = habit.icon;
                            textFallback.className = 'text-2xl';
                            e.currentTarget.parentNode?.appendChild(textFallback);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-cinzel font-semibold text-lg text-midnight mb-2">
                          {habit.title}
                        </h3>
                        <p className="font-inter text-storm-gray text-sm leading-relaxed mb-3">
                          {habit.description}
                        </p>
                        
                        {/* AI Wisdom */}
                        {habit.wisdom && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                              <span className="font-inter font-medium text-xs text-amber-700 uppercase tracking-wide">
                                Oracle's Wisdom
                              </span>
                            </div>
                            <p className="font-inter text-amber-800 text-sm italic">
                              "{habit.wisdom}"
                            </p>
                          </div>
                        )}

                        {/* AI Actionable Steps */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Target className="w-3 h-3" />
                            <span className="font-inter font-medium uppercase tracking-wide">
                              AI Insights
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                              <span className="font-inter text-gray-700">
                                <strong>Category:</strong> {habit.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                              <span className="font-inter text-gray-700">
                                <strong>Difficulty:</strong> {habit.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                              <span className="font-inter text-gray-700">
                                <strong>Frequency:</strong> {habit.suggested_frequency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="space-y-3">
                      {/* Streak and completion info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="font-inter text-storm-gray">
                            {currentStreak} day streak
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-aegean-blue" />
                          <span className="font-inter text-storm-gray">
                            {completionRate}% rate
                          </span>
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <div className="flex gap-3">
                        <Button
                          text={
                            isCompleted 
                              ? (freq === 'weekly' ? 'Completed This Week ✓' : freq === 'monthly' ? 'Completed This Month ✓' : 'Completed Today ✓')
                              : completingHabit === habit.id 
                                ? 'Completing...'
                                : 'Complete Quest'
                          }
                          onClick={() => handleCompleteHabit(habit)}
                          variant={isCompleted ? "secondary" : "primary"}
                          disabled={isCompleted || completingHabit === habit.id}
                          className="flex-1"
                        />
                        <Button
                          text={deletingHabit === habit.id ? 'Deleting...' : 'Delete'}
                          onClick={() => handleDeleteHabit(habit.id)}
                          variant="danger"
                          disabled={deletingHabit === habit.id}
                        />
                      </div>
                      
                      {/* Progress Analysis */}
                      {currentStreak >= 3 && (
                        <HabitProgressAnalysis
                          habitId={habit.id}
                          habitName={habit.title}
                          currentStreak={currentStreak}
                          completionRate={completionRate}
                        />
                      )}
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-bronze/20 rounded-full"></div>
                    <div className="absolute top-2 left-2 w-1 h-1 bg-gold/30 rounded-full"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Divine Quests */}
 

      </div>
    </div>
  );
};

export default Dashboard;