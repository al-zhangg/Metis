import React, { useState, useEffect } from 'react';
import { Crown, Flame, Brain } from 'lucide-react';
import Card from '../components/Card';
import XPBar from '../components/XPBar';
import Button from '../components/Button';
import AIInsightCard from '../components/AIInsightCard';
import HabitProgressAnalysis from '../components/HabitProgressAnalysis';
import { enhancedApi } from '../services/enhancedApi';
import type { Habit, Quest } from '../services/supabaseClient';

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabitForAnalysis, setSelectedHabitForAnalysis] = useState<number | null>(null);
  const [dailyWisdom, setDailyWisdom] = useState<string>('');

  // Mock user stats
  const [userStats, setUserStats] = useState({
    currentXP: 1250,
    maxXP: 2000,
    level: 8,
    totalStreak: 45
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [habitsData, questsData] = await Promise.all([
          enhancedApi.getHabits(),
          enhancedApi.getQuests()
        ]);
        setHabits(habitsData);
        setQuests(questsData);
        
        // Generate daily wisdom based on user's habits
        const habitTitles = habitsData.map(h => h.title).join(', ');
        setDailyWisdom(`Today, focus on ${habitTitles.split(',')[0]} - small steps lead to great journeys.`);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCompleteHabit = async (habitId: number) => {
    const result = await enhancedApi.completeHabit(habitId);
    if (result.success) {
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? { ...habit, current_streak: habit.current_streak + 1 } : habit
      ));
      setUserStats(prev => ({
        ...prev,
        currentXP: prev.currentXP + (result.xpGained || 25)
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marble to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze mx-auto mb-4"></div>
          <p className="font-inter text-gray-600">Loading your wisdom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marble to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with XP Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-cinzel font-bold text-3xl text-midnight-blue">
              Welcome, Philosopher Warrior
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-inter font-semibold text-bronze">
                  {userStats.totalStreak} day streak
                </span>
              </div>
            </div>
          </div>
          
          <XPBar
            currentXP={userStats.currentXP}
            maxXP={userStats.maxXP}
            level={userStats.level}
            className="mb-6"
          />
          
          {/* Daily AI Wisdom */}
          <AIInsightCard
            type="wisdom"
            title="Today's Oracle Wisdom"
            content={dailyWisdom}
            className="mb-6"
          />
        </div>

        {/* Quests Section */}
        <div className="mb-8">
          <h2 className="font-cinzel font-semibold text-2xl text-midnight-blue mb-4 flex items-center gap-2">
            <Crown className="w-6 h-6 text-bronze" />
            Divine Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map(quest => (
              <Card
                key={quest.id}
                title={quest.title}
                description={quest.description}
                status={quest.status === 'completed' ? 'completed' : 'active'}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div
                      className="bg-laurel-green h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-inter text-sm text-gray-600">
                    {quest.progress}/{quest.total}
                  </span>
                </div>
                <p className="font-inter text-sm text-bronze font-medium mt-2">
                  +{quest.xp_reward} XP
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Habits Section */}
        <div>
          <h2 className="font-cinzel font-semibold text-2xl text-midnight-blue mb-4">
            Today's Habits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => (
              <Card
                key={habit.id}
                title={habit.title}
                description={habit.description}
                icon={habit.icon}
                status={habit.status === 'active' ? 'active' : 'completed'}
              >
                <div className="space-y-3">
                  {/* AI-Enhanced Habit Info */}
                  <div className="bg-bronze/5 rounded-lg p-2">
                    <p className="font-cinzel text-xs text-bronze font-semibold">
                      {habit.mythic_title}
                    </p>
                    <p className="font-inter text-xs text-gray-600 mt-1">
                      {habit.wisdom}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-inter text-sm font-medium text-gray-700">
                      {habit.current_streak} day streak
                    </span>
                    <span className="font-inter text-xs text-gray-500">
                      ({habit.completion_rate}% rate)
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {habit.status === 'active' && (
                      <Button
                        text="Complete"
                        onClick={() => handleCompleteHabit(habit.id)}
                        variant="primary"
                        className="text-sm px-3 py-1 flex-1"
                      />
                    )}
                    <button
                      onClick={() => setSelectedHabitForAnalysis(habit.id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Brain className="w-3 h-3" />
                      AI
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* AI Analysis Modal */}
        {selectedHabitForAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-blue/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cinzel font-bold text-xl text-midnight-blue">
                    AI Habit Analysis
                  </h3>
                  <button
                    onClick={() => setSelectedHabitForAnalysis(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <HabitProgressAnalysis
                  habitId={selectedHabitForAnalysis}
                  habitName={habits.find(h => h.id === selectedHabitForAnalysis)?.title || ''}
                  currentStreak={habits.find(h => h.id === selectedHabitForAnalysis)?.current_streak || 0}
                  completionRate={habits.find(h => h.id === selectedHabitForAnalysis)?.completion_rate || 0}
                  onAdjustmentApplied={() => setSelectedHabitForAnalysis(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;