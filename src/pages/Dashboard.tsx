import React, { useState, useEffect } from 'react';
import { Home, Target, Flame, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import XPBar from '../components/XPBar';
import HabitProgressAnalysis from '../components/HabitProgressAnalysis';
import { enhancedApi } from '../services/enhancedApi';
import { dailyTracker } from '../services/dailyTracker';
import type { Habit, Quest } from '../services/supabaseClient';

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingHabit, setCompletingHabit] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitsData, questsData] = await Promise.all([
          enhancedApi.getHabits(),
          enhancedApi.getQuests()
        ]);
        setHabits(habitsData);
        setQuests(questsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompleteHabit = async (habitId: number) => {
    if (dailyTracker.isCompletedToday(habitId)) {
      return; // Already completed today
    }

    setCompletingHabit(habitId);
    try {
      const success = dailyTracker.markCompleted(habitId);
      if (success) {
        // Update the habits list to reflect completion
        setHabits(prev => prev.map(habit => 
          habit.id === habitId 
            ? { ...habit, current_streak: dailyTracker.getStreak(habitId) }
            : habit
        ));
      }
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setCompletingHabit(null);
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

  const completedToday = habits.filter(habit => dailyTracker.isCompletedToday(habit.id)).length;
  const totalHabits = habits.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-marble via-slate-mist to-olympus-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-64 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8)), url('https://images.pexels.com/photos/8828489/pexels-photo-8828489.jpeg?auto=compress&cs=tinysrgb&w=1200')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="font-cinzel font-bold text-4xl mb-4">
                Welcome, Divine Warrior
              </h1>
              <p className="font-inter text-xl opacity-90">
                Your journey to wisdom continues
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 -mt-16 relative z-10">
        {/* XP Progress */}
        <div className="mb-8">
          <XPBar currentXP={1250} maxXP={2000} level={8} />
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
                const isCompleted = dailyTracker.isCompletedToday(habit.id);
                const currentStreak = dailyTracker.getStreak(habit.id);
                const completionRate = dailyTracker.getCompletionRate(habit.id);
                
                return (
                  <Card
                    key={habit.id}
                    title={habit.mythic_title || habit.title}
                    description={habit.wisdom || habit.description}
                    icon={habit.icon}
                    status={isCompleted ? 'completed' : 'active'}
                  >
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
                      <Button
                        text={
                          isCompleted 
                            ? "Completed Today ✓" 
                            : completingHabit === habit.id 
                              ? "Completing..." 
                              : "Complete Quest"
                        }
                        onClick={() => handleCompleteHabit(habit.id)}
                        variant={isCompleted ? "secondary" : "primary"}
                        disabled={isCompleted || completingHabit === habit.id}
                        className="w-full"
                      />
                      
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
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Divine Quests */}
        <div>
          <h2 className="font-cinzel font-semibold text-2xl text-midnight mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-aegean-blue" />
            Quests
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quests.map(quest => (
              <Card
                key={quest.id}
                title={quest.title}
                description={quest.description}
                icon="⚔️"
                status={quest.status === 'completed' ? 'completed' : 'active'}
              >
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-mist rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-aegean-blue to-deep-aegean h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-inter text-storm-gray">
                      {quest.progress}/{quest.total} completed
                    </span>
                    <span className="font-inter font-semibold text-aegean-blue">
                      +{quest.xp_reward} XP
                    </span>
                  </div>
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