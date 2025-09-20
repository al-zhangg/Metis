import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './supabaseClient';
import { aiService } from './aiService';
import type { Habit, JournalEntry, Quest, UserProfile } from './supabaseClient';

// Enhanced API service with AI integration
class EnhancedApiService {
  private userId: string = '1'; // Mock user ID for development

  // Habit Management with AI Classification
  async createHabit(habitData: {
    title: string;
    description: string;
    icon: string;
  }): Promise<{ success: boolean; habit?: Habit; error?: string }> {
    try {
      // Get AI classification
      const classification = await aiService.classifyHabit(
        habitData.title,
        habitData.description
      );

      const newHabit: Partial<Habit> = {
        user_id: this.userId,
        title: habitData.title,
        description: habitData.description,
        icon: habitData.icon,
        category: classification.category,
        difficulty: classification.difficulty,
        suggested_frequency: classification.suggestedFrequency,
        mythic_title: classification.mythicTitle,
        wisdom: classification.wisdom,
        current_streak: 0,
        completion_rate: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // In a real app, this would save to Supabase
      // if (supabase) {
      //   const { data, error } = await supabase.from('habits').insert(newHabit).select().single();
      // }
      
      // Mock response for development
      const mockHabit: Habit = {
        id: Date.now(),
        ...newHabit as Habit
      };

      return { success: true, habit: mockHabit };
    } catch (error) {
      console.error('Error creating habit:', error);
      return { success: false, error: 'Failed to create habit' };
    }
  }

  async getHabits(): Promise<Habit[]> {
    try {
      // Use Supabase if configured, otherwise use mock data
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('habits').select('*').eq('user_id', this.userId);
        if (error) throw error;
        return data || [];
      }
      
      // Mock data with AI-enhanced fields
      return [
        {
          id: 1,
          user_id: this.userId,
          title: "Morning Meditation",
          description: "Find inner peace like the ancient philosophers",
          icon: "🧘‍♂️",
          category: "mindfulness",
          difficulty: "easy",
          suggested_frequency: "daily",
          mythic_title: "Path of the Serene Oracle",
          wisdom: "In stillness, wisdom speaks loudest.",
          current_streak: 7,
          completion_rate: 85,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          user_id: this.userId,
          title: "Physical Training",
          description: "Strengthen body and mind like Spartan warriors",
          icon: "💪",
          category: "health",
          difficulty: "medium",
          suggested_frequency: "daily",
          mythic_title: "Forge of the Titan",
          wisdom: "Strength grows in the crucible of discipline.",
          current_streak: 12,
          completion_rate: 92,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  }

  async completeHabit(habitId: number): Promise<{ success: boolean; xpGained?: number }> {
    try {
      if (isSupabaseConfigured() && supabase) {
        // Update habit in Supabase
        const { error } = await supabase
          .from('habits')
          .update({ 
            current_streak: supabase!.raw('current_streak + 1'),
            updated_at: new Date().toISOString()
          })
          .eq('id', habitId);
        
        if (error) throw error;
      }
      
      return { success: true, xpGained: 25 };
    } catch (error) {
      console.error('Error completing habit:', error);
      return { success: false };
    }
  }

  // Journal Management with AI Insights
  async createJournalEntry(entry: string): Promise<{ success: boolean; journalEntry?: JournalEntry; error?: string }> {
    try {
      // Get AI analysis
      const insights = await aiService.analyzeJournal(entry);

      const newEntry: Partial<JournalEntry> = {
        user_id: this.userId,
        entry,
        mood: insights.mood,
        obstacles: insights.obstacles,
        mythic_advice: insights.mythicAdvice,
        oracle_title: insights.oracleTitle,
        actionable_steps: insights.actionableSteps,
        created_at: new Date().toISOString(),
      };

      // Mock response
      const mockEntry: JournalEntry = {
        id: Date.now(),
        ...newEntry as JournalEntry
      };

      return { success: true, journalEntry: mockEntry };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return { success: false, error: 'Failed to create journal entry' };
    }
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      // Mock data with AI insights
      return [
        {
          id: 1,
          user_id: this.userId,
          entry: "Today I reflected on Socrates' teaching that 'the unexamined life is not worth living.' This wisdom resonates deeply with my journey of self-improvement.",
          mood: "positive",
          obstacles: ["Self-doubt", "Time management"],
          mythic_advice: "Like Athena's owl, wisdom comes to those who seek in darkness.",
          oracle_title: "Wisdom of Self-Knowledge",
          actionable_steps: ["Schedule daily reflection time", "Read one philosophical text weekly"],
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          user_id: this.userId,
          entry: "Struggling with maintaining my habits lately. Perhaps this is a test, like the trials faced by heroes in ancient myths.",
          mood: "mixed",
          obstacles: ["Motivation", "Consistency"],
          mythic_advice: "Even Hercules faced twelve labors; your trials forge strength.",
          oracle_title: "The Hero's Challenge",
          actionable_steps: ["Start with smallest habit", "Find accountability partner"],
          created_at: new Date(Date.now() - 172800000).toISOString(),
        }
      ];
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  }

  // Dynamic Quest Generation
  async getQuests(): Promise<Quest[]> {
    try {
      // In a real app, these would be dynamically generated based on user behavior
      return [
        {
          id: 1,
          user_id: this.userId,
          title: "Complete 5 habits today",
          description: "Channel your inner Hercules",
          type: "daily",
          xp_reward: 50,
          progress: 2,
          total: 5,
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          user_id: this.userId,
          title: "Maintain 7-day streak",
          description: "Persistence like Odysseus",
          type: "weekly",
          xp_reward: 100,
          progress: 7,
          total: 7,
          status: "completed",
          created_at: new Date().toISOString(),
        }
      ];
    } catch (error) {
      console.error('Error fetching quests:', error);
      return [];
    }
  }

  // Goal Adjustment Analysis
  async analyzeHabitProgress(habitId: number): Promise<any> {
    try {
      // Get habit data and recent journal entries
      const habits = await this.getHabits();
      const habit = habits.find(h => h.id === habitId);
      const journalEntries = await this.getJournalEntries();
      
      if (!habit) return null;

      // Get AI recommendation
      const adjustment = await aiService.suggestGoalAdjustment(
        habit.title,
        habit.current_streak,
        habit.completion_rate,
        journalEntries.map(e => e.entry).slice(0, 3)
      );

      return adjustment;
    } catch (error) {
      console.error('Error analyzing habit progress:', error);
      return null;
    }
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // Mock profile data
      return {
        id: this.userId,
        username: "PhilosopherWarrior",
        current_xp: 1250,
        level: 8,
        total_habits: 15,
        achievements: [
          {
            id: 1,
            title: "Wisdom Seeker",
            description: "Complete 10 meditation sessions",
            icon: "🦉",
            unlocked_at: "2024-01-10"
          },
          {
            id: 2,
            title: "Oracle's Insight",
            description: "Write 20 journal entries",
            icon: "📜",
            unlocked_at: "2024-01-12"
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
}

export const enhancedApi = new EnhancedApiService();