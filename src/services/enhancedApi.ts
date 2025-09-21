import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './supabaseClient';
import { aiService } from './aiService';
import { useAuth } from '../contexts/AuthContext';
import type { Habit, JournalEntry, Quest, UserProfile } from './supabaseClient';

// Enhanced API service with AI integration
class EnhancedApiService {
  private currentUser: any = null
  private habits: Habit[] = [] // Store habits locally

  // Load habits from localStorage
  private loadHabitsFromStorage(): void {
    try {
      const stored = localStorage.getItem('metis_habits');
      if (stored) {
        this.habits = JSON.parse(stored);
        console.log('Loaded habits from storage:', this.habits);
      }
    } catch (error) {
      console.error('Error loading habits from storage:', error);
      this.habits = [];
    }
  }

  // Save habits to localStorage
  private saveHabitsToStorage(): void {
    try {
      localStorage.setItem('metis_habits', JSON.stringify(this.habits));
      console.log('Saved habits to storage:', this.habits);
    } catch (error) {
      console.error('Error saving habits to storage:', error);
    }
  }

  // Load profile from localStorage
  private loadProfileFromStorage(): UserProfile | null {
    try {
      const stored = localStorage.getItem('metis_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        console.log('Loaded profile from storage:', profile);
        return profile;
      }
    } catch (error) {
      console.error('Error loading profile from storage:', error);
    }
    return null;
  }

  // Save profile to localStorage
  private saveProfileToStorage(profile: UserProfile): void {
    try {
      localStorage.setItem('metis_profile', JSON.stringify(profile));
      console.log('Saved profile to storage:', profile);
    } catch (error) {
      console.error('Error saving profile to storage:', error);
    }
  }

  private getCurrentUserId(): string | null {
    return this.currentUser?.sub || this.currentUser?.id || null;
  }

  private getCurrentUserEmail(): string | null {
    return this.currentUser?.email || null;
  }

  private getCurrentUserName(): string | null {
    return this.currentUser?.name || this.currentUser?.username || this.currentUser?.email?.split('@')[0] || 'User';
  }

  setCurrentUser(user: any) {
    this.currentUser = user;
    console.log('Enhanced API: Current user set:', user?.sub);
  }

  // Habit Management with AI Classification
  async createHabit(habitData: {
    title: string;
    description: string;
    icon: string;
  }): Promise<{ success: boolean; habit?: Habit; error?: string }> {
    try {
      console.log('Creating habit for user:', this.getCurrentUserId());
      
      // Get AI classification
      const classification = await aiService.classifyHabit(
        habitData.title,
        habitData.description
      );

      const newHabit: Partial<Habit> = {
        user_id: this.getCurrentUserId() || 'anonymous',
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

      // Save to Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('habits')
          .insert(newHabit)
          .select()
          .single();
        
        if (error) {
          console.error('Supabase habit insert error:', error);
          // Fall through to mock response
        } else if (data) {
          console.log('Habit saved to Supabase:', data);
          return { success: true, habit: data };
        }
      }
      
      // Mock response for development
      const mockHabit: Habit = {
        id: Date.now(),
        ...newHabit as Habit
      };

      // Add to local habits array
      this.habits.unshift(mockHabit); // Add to beginning of array
      
      // Save to localStorage
      this.saveHabitsToStorage();

      console.log('Using mock habit:', mockHabit);
      console.log('Updated habits array:', this.habits);
      return { success: true, habit: mockHabit };
    } catch (error) {
      console.error('Error creating habit:', error);
      return { success: false, error: 'Failed to create habit' };
    }
  }

  async getHabits(): Promise<Habit[]> {
    try {
      const userId = this.getCurrentUserId();
      console.log('Getting habits for user:', userId);
      console.log('Current habits array:', this.habits);

      // Use Supabase if configured, otherwise use mock data
      if (isSupabaseConfigured() && supabase && userId) {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      }
      
      // Load from localStorage first
      this.loadHabitsFromStorage();
      
      // If no habits in storage, initialize with defaults
      if (this.habits.length === 0) {
        console.log('No habits found, initializing with defaults');
        // Initialize with default examples for first-time users
        this.habits = [
          {
            id: 1,
            user_id: userId || 'anonymous',
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
            user_id: userId || 'anonymous',
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
        
        // Save defaults to localStorage
        this.saveHabitsToStorage();
      }
      
      console.log('Returning habits:', this.habits);
      return this.habits;
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  }

  async completeHabit(habitId: number): Promise<{ success: boolean; xpGained?: number }> {
    try {
      if (isSupabaseConfigured() && supabase) {
        // Get current habit data
        const { data: habit, error: fetchError } = await supabase
          .from('habits')
          .select('current_streak, completion_rate')
          .eq('id', habitId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Update habit streak and completion rate
        const { error: updateError } = await supabase
          .from('habits')
          .update({
            current_streak: (habit?.current_streak || 0) + 1,
            completion_rate: Math.min((habit?.completion_rate || 0) + 5, 100),
            updated_at: new Date().toISOString()
          })
          .eq('id', habitId);
        
        if (updateError) throw updateError;
        
        // Update user XP
        const userId = this.getCurrentUserId();
        if (userId) {
          const { error: xpError } = await supabase.rpc('increment_user_xp', {
            user_id: userId,
            xp_amount: 25
          });
          
          if (xpError) console.warn('Failed to update XP:', xpError);
        }
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
      console.log('Creating journal entry for user:', this.getCurrentUserId());
      
      // Get AI analysis
      const insights = await aiService.analyzeJournal(entry);

      const newEntry: Partial<JournalEntry> = {
        user_id: this.getCurrentUserId() || 'anonymous',
        entry,
        mood: insights.mood,
        obstacles: insights.obstacles,
        mythic_advice: insights.mythicAdvice,
        oracle_title: insights.oracleTitle,
        actionable_steps: insights.actionableSteps,
        created_at: new Date().toISOString(),
      };

      // Save to Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(newEntry)
          .select()
          .single();
        
        if (error) {
          console.error('Supabase journal insert error:', error);
          // Fall through to mock response
        } else if (data) {
          console.log('Journal entry saved to Supabase:', data);
          return { success: true, journalEntry: data };
        }
      }
      
      // Mock response for development
      const mockEntry: JournalEntry = {
        id: Date.now(),
        ...newEntry as JournalEntry
      };

      console.log('Using mock journal entry:', mockEntry);
      return { success: true, journalEntry: mockEntry };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return { success: false, error: 'Failed to create journal entry' };
    }
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return [];

      console.log('Getting journal entries for user:', userId);

      // Use Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) {
          console.error('Supabase journal error:', error);
          // Fall through to mock data
        } else if (data) {
          console.log('Journal entries loaded from Supabase:', data.length);
          return data;
        }
      }
      
      // Mock data with AI insights
      const mockEntries = [
        {
          id: 1,
          user_id: userId,
          entry: "Today I reflected on Socrates' teaching that 'the unexamined life is not worth living.' This wisdom resonates deeply with my journey of self-improvement.",
          mood: "positive",
          sentiment: "positive",
          obstacles: ["Self-doubt", "Time management"],
          mythic_advice: "Like Athena's owl, wisdom comes to those who seek in darkness.",
          oracle_title: "Wisdom of Self-Knowledge",
          actionable_steps: ["Schedule daily reflection time", "Read one philosophical text weekly"],
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          user_id: userId,
          entry: "Struggling with maintaining my habits lately. Perhaps this is a test, like the trials faced by heroes in ancient myths.",
          mood: "mixed",
          sentiment: "mixed",
          obstacles: ["Motivation", "Consistency"],
          mythic_advice: "Even Hercules faced twelve labors; your trials forge strength.",
          oracle_title: "The Hero's Challenge",
          actionable_steps: ["Start with smallest habit", "Find accountability partner"],
          created_at: new Date(Date.now() - 172800000).toISOString(),
        }
      ];
      
      console.log('Using mock journal entries:', mockEntries.length);
      return mockEntries;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  }

  // Dynamic Quest Generation
  async getQuests(): Promise<Quest[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return [];

      // Use Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('quests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      }
      
      // Load from localStorage first
      let quests = this.loadQuestsFromStorage();
      
      // If no quests in storage, initialize with defaults
      if (quests.length === 0) {
        console.log('No quests found, initializing with defaults');
        quests = [
          {
            id: 1,
            user_id: userId,
            title: "Complete 5 habits today",
            description: "Channel your inner Hercules",
            type: "daily",
            xp_reward: 50,
            progress: 0,
            total: 5,
            status: "active",
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            user_id: userId,
            title: "Maintain 7-day streak",
            description: "Persistence like Odysseus",
            type: "weekly",
            xp_reward: 100,
            progress: 0,
            total: 7,
            status: "active",
            created_at: new Date().toISOString(),
          },
          {
            id: 3,
            user_id: userId,
            title: "Write 3 journal entries",
            description: "Reflect like the ancient philosophers",
            type: "weekly",
            xp_reward: 75,
            progress: 0,
            total: 3,
            status: "active",
            created_at: new Date().toISOString(),
          }
        ];
        
        // Save defaults to localStorage
        this.saveQuestsToStorage(quests);
      }
      
      console.log('Returning quests:', quests);
      return quests;
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
      const userId = this.getCurrentUserId();
      if (!userId) return null;

      console.log('Getting profile for user:', userId);

      // Use Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Supabase profile error:', error);
          // Fall through to localStorage
        } else if (data) {
          console.log('Profile loaded from Supabase:', data);
          return data;
        }
      }
      
      // Try to load from localStorage first
      let profile = this.loadProfileFromStorage();
      
      // If no profile in storage, create a new one
      if (!profile) {
        console.log('No profile found, creating new one');
        profile = {
          id: userId,
          username: this.getCurrentUserName() || "PhilosopherWarrior",
          email: this.getCurrentUserEmail() || "user@example.com",
          current_xp: 1250,
          level: 8,
          total_habits: 0, // Will be updated based on actual habits
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
        
        // Save new profile to localStorage
        this.saveProfileToStorage(profile);
      }
      
      // Update total_habits based on current habits
      const habits = await this.getHabits();
      profile.total_habits = habits.length;
      
      console.log('Using profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Add XP when habit is completed
  async addXP(amount: number): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return;

      profile.current_xp += amount;
      
      // Check for level up (every 2000 XP)
      const newLevel = Math.floor(profile.current_xp / 2000) + 1;
      if (newLevel > profile.level) {
        profile.level = newLevel;
        console.log(`Level up! New level: ${profile.level}`);
      }

      profile.updated_at = new Date().toISOString();
      
      // Save updated profile
      this.saveProfileToStorage(profile);
      
      console.log(`Added ${amount} XP. Total: ${profile.current_xp}, Level: ${profile.level}`);
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }

  // Complete a quest and add XP
  async completeQuest(questId: number): Promise<{ success: boolean; xpGained?: number; error?: string }> {
    try {
      const quests = await this.getQuests();
      const quest = quests.find(q => q.id === questId);
      
      if (!quest) {
        return { success: false, error: 'Quest not found' };
      }
      
      if (quest.status === 'completed') {
        return { success: false, error: 'Quest already completed' };
      }
      
      // Mark quest as completed
      quest.status = 'completed';
      quest.progress = quest.total;
      
      // Save quests to localStorage
      this.saveQuestsToStorage(quests);
      
      // Add XP reward
      await this.addXP(quest.xp_reward);
      
      console.log(`Quest completed: ${quest.title}, XP gained: ${quest.xp_reward}`);
      
      return { success: true, xpGained: quest.xp_reward };
    } catch (error) {
      console.error('Error completing quest:', error);
      return { success: false, error: 'Failed to complete quest' };
    }
  }

  // Save quests to localStorage
  private saveQuestsToStorage(quests: Quest[]): void {
    try {
      localStorage.setItem('metis_quests', JSON.stringify(quests));
      console.log('Saved quests to storage:', quests);
    } catch (error) {
      console.error('Error saving quests to storage:', error);
    }
  }

  // Load quests from localStorage
  private loadQuestsFromStorage(): Quest[] {
    try {
      const stored = localStorage.getItem('metis_quests');
      if (stored) {
        const quests = JSON.parse(stored);
        console.log('Loaded quests from storage:', quests);
        return quests;
      }
    } catch (error) {
      console.error('Error loading quests from storage:', error);
    }
    return [];
  }
}

export const enhancedApi = new EnhancedApiService();