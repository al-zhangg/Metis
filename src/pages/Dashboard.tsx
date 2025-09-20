import React, { useState, useEffect } from 'react';
import { Crown, Flame } from 'lucide-react';
import Card from '../components/Card';
import XPBar from '../components/XPBar';
import Button from '../components/Button';
import { getHabits, getQuests, completeHabit } from '../services/mockApi';

interface Habit {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: string;
  streak: number;
  completed: boolean;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  type: string;
  progress: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

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
          getHabits(1),
          getQuests(1)
        ]);
        setHabits(habitsData);
        setQuests(questsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCompleteHabit = async (habitId: number) => {
    const result = await completeHabit(habitId);
    if (result.success) {
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? { ...habit, completed: true } : habit
      ));
      setUserStats(prev => ({
        ...prev,
        currentXP: prev.currentXP + 25
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
                status={quest.progress >= quest.total ? 'completed' : 'active'}
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
                  +{quest.xpReward} XP
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
                status={habit.completed ? 'completed' : 'active'}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-inter text-sm font-medium text-gray-700">
                      {habit.streak} day streak
                    </span>
                  </div>
                  {!habit.completed && (
                    <Button
                      text="Complete"
                      onClick={() => handleCompleteHabit(habit.id)}
                      variant="primary"
                      className="text-sm px-4 py-2"
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;