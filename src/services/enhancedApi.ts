import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './supabaseClient';
import { aiService } from './aiService';
import { useAuth } from '../contexts/AuthContext';
import type { Habit, JournalEntry, Quest, UserProfile } from './supabaseClient';

// Enhanced API service with AI integration
class EnhancedApiService {
  private currentUser: any = null
  private habits: Habit[] = [] // Store habits locally
  private habitsListeners: Array<(habits: Habit[]) => void> = [];
  private questsListeners: Array<(quests: Quest[]) => void> = [];
  private journalEntries: JournalEntry[] = [];
  private journalListeners: Array<(entries: JournalEntry[]) => void> = [];

  // Load habits from localStorage
  private loadHabitsFromStorage(): void {
    try {
      const key = this.makeHabitsKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        this.habits = JSON.parse(stored);
        console.log(`Loaded habits from storage (${key}):`, this.habits);
      } else {
        // If nothing saved for this user, attempt to migrate legacy global storage
        const legacy = localStorage.getItem('metis_habits');
        if (legacy) {
          try {
            const legacyHabits = JSON.parse(legacy);
            // Filter or reassign user_id to current user
            const userId = this.getCurrentUserId() || 'anonymous';
            const migrated = Array.isArray(legacyHabits)
              ? legacyHabits.map((h: any, idx: number) => ({ ...h, user_id: userId, id: h.id || Date.now() + idx }))
              : [];
            this.habits = migrated;
            // Persist under the new per-user key
            localStorage.setItem(key, JSON.stringify(this.habits));
            console.log(`Migrated legacy habits into (${key}): count=${this.habits.length}`);
          } catch (e) {
            console.warn('Failed to migrate legacy habits:', e);
            this.habits = [];
          }
        } else {
          this.habits = [];
        }
      }
    } catch (error) {
      console.error('Error loading habits from storage:', error);
      this.habits = [];
    }
  }

  // Save habits to localStorage
  private saveHabitsToStorage(): void {
    try {
  const key = this.makeHabitsKey();
  localStorage.setItem(key, JSON.stringify(this.habits));
  // Debug: show exact key and serialized length to help trace persistence
  console.debug('[enhancedApi] Saved habits to storage', { key, count: this.habits.length, bytes: new Blob([JSON.stringify(this.habits)]).size });
    } catch (error) {
      console.error('Error saving habits to storage:', error);
    }
  }

  // Load profile from localStorage
  private loadProfileFromStorage(): UserProfile | null {
    try {
  const userId = this.getCurrentUserId();
  if (!userId) return null;
  const stored = localStorage.getItem(`metis_profile_${userId}`);
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
  const userId = profile?.id || this.getCurrentUserId();
  if (!userId) return;
  localStorage.setItem(`metis_profile_${userId}`, JSON.stringify(profile));
      console.log('Saved profile to storage:', profile);
    } catch (error) {
      console.error('Error saving profile to storage:', error);
    }
  }

  private getCurrentUserId(): string | null {
    return this.currentUser?.sub || this.currentUser?.id || null;
  }

  // Build a user-specific storage key for habits
  private makeHabitsKey(): string {
    const userId = this.getCurrentUserId() || 'anonymous';
    return `metis_habits_${userId}`;
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
    // Load habits for the newly-set user into the in-memory cache
    try {
      this.loadHabitsFromStorage();
      // Load per-user journal entries as well
      try { this.loadJournalFromStorage(); } catch (e) { console.warn('Failed to load journal for new user:', e); }
    } catch (e) {
      console.warn('Failed to load habits for new user:', e);
    }
  }

  // Subscribe to journal changes. Returns an unsubscribe function.
  addJournalListener(fn: (entries: JournalEntry[]) => void) {
    this.journalListeners.push(fn);
    try { fn(this.journalEntries); } catch (e) { console.warn('journal listener error:', e); }
    return () => {
      this.journalListeners = this.journalListeners.filter(l => l !== fn);
    };
  }

  // Journal persistence helpers
  private makeJournalKey(): string {
    const userId = this.getCurrentUserId() || 'anonymous';
    return `metis_journal_${userId}`;
  }

  private loadJournalFromStorage(): void {
    try {
      const key = this.makeJournalKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        this.journalEntries = JSON.parse(stored);
        console.log(`Loaded journal entries from storage (${key}):`, this.journalEntries.length);
      } else {
        this.journalEntries = [];
      }
    } catch (error) {
      console.error('Error loading journal entries from storage:', error);
      this.journalEntries = [];
    }
  }

  private saveJournalToStorage(): void {
    try {
      const key = this.makeJournalKey();
      localStorage.setItem(key, JSON.stringify(this.journalEntries));
      console.debug('[enhancedApi] Saved journal to storage', { key, count: this.journalEntries.length });
    } catch (error) {
      console.error('Error saving journal entries to storage:', error);
    }
  }

  // Subscribe to habit changes. Returns an unsubscribe function.
  addHabitsListener(fn: (habits: Habit[]) => void) {
    this.habitsListeners.push(fn);
    // Immediately call with current value
    try { fn(this.habits); } catch (e) { console.warn('habits listener error:', e); }
    return () => {
      this.habitsListeners = this.habitsListeners.filter(l => l !== fn);
    };
  }

  // Subscribe to quests changes. Returns an unsubscribe function.
  addQuestsListener(fn: (quests: Quest[]) => void) {
    this.questsListeners.push(fn);
    try { fn(this.loadQuestsFromStorage()); } catch (e) { console.warn('quests listener error:', e); }
    return () => {
      this.questsListeners = this.questsListeners.filter(l => l !== fn);
    };
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
        ...(newHabit as Habit),
        id: Date.now(),
      };

      // Add to local habits array
      this.habits.unshift(mockHabit); // Add to beginning of array
      
      // Save to localStorage
      this.saveHabitsToStorage();

      // Notify in-memory listeners synchronously
      try {
        this.habitsListeners.forEach(fn => { try { fn(this.habits); } catch (e) { console.warn('habits listener call failed', e); } });
      } catch (e) {
        console.warn('Failed to notify habits listeners:', e);
      }

      // Create a simple related quest when a habit is added (development fallback)
      try {
        const userId = this.getCurrentUserId() || 'anonymous';
        const newQuest: Quest = {
          id: Date.now(),
          user_id: userId,
          title: `Complete ${mockHabit.title} today`,
          description: `Daily quest to complete ${mockHabit.title}`,
          type: 'daily',
          xp_reward: 25,
          progress: 0,
          total: 1,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        const existing = this.loadQuestsFromStorage();
        existing.unshift(newQuest);
        this.saveQuestsToStorage(existing);
        // notify listeners
        this.questsListeners.forEach(fn => { try { fn(existing); } catch (e) { console.warn('quests listener call failed', e); } });
        // dispatch event
        try { window.dispatchEvent(new CustomEvent('metis:quests-updated', { detail: { userId } })); } catch (e) { /* ignore */ }
      } catch (e) {
        console.warn('Failed to create related quest:', e);
      }

      // Notify other parts of the app that habits changed
      try {
        const detail = { userId: this.getCurrentUserId() };
        console.debug('Dispatching metis:habits-updated', detail);
        window.dispatchEvent(new CustomEvent('metis:habits-updated', { detail }));
      } catch (e) {
        console.warn('Could not dispatch habits-updated event:', e);
      }
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
        try {
          const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            // Don't let Supabase schema issues stop local fallback
      console.warn('[enhancedApi] Supabase habit fetch error, falling back to local storage:', error);
          } else if (data) {
      console.debug('[enhancedApi] Supabase returned habits count=', (data || []).length);
      return data || [];
          }
        } catch (err) {
      console.warn('[enhancedApi] Unexpected Supabase error fetching habits, falling back to local storage:', err);
        }
      }
      
      // Load from localStorage first
    this.loadHabitsFromStorage();
    console.debug('[enhancedApi] Loaded local habits count=', this.habits.length);

  // Do not auto-seed defaults here. Seeding occurs during profile creation (upsertUserProfile) only for brand-new accounts.

    console.debug('[enhancedApi] Returning habits', { count: this.habits.length });
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

  // Delete a habit by id (Supabase if configured, otherwise localStorage)
  async deleteHabit(habitId: number): Promise<{ success: boolean; error?: string }> {
    try {
  const userId = this.getCurrentUserId();
  console.debug('[enhancedApi] deleteHabit start', { habitId, userId });
  if (!userId) return { success: false, error: 'No user' };

      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('habits').delete().eq('id', habitId).eq('user_id', userId);
        if (error) {
      console.warn('[enhancedApi] Supabase habit delete error:', error);
          // Fall back to local removal
        } else {
          // Dispatch update event so UI can refresh
      try { window.dispatchEvent(new CustomEvent('metis:habits-updated', { detail: { userId } })); } catch (e) {}
      console.debug('[enhancedApi] Supabase delete succeeded for habitId=', habitId);
      return { success: true };
        }
      }

      // Local deletion fallback
    this.loadHabitsFromStorage();
    const before = this.habits.length;
    this.habits = this.habits.filter(h => h.id !== habitId);
    const after = this.habits.length;
    console.debug('[enhancedApi] Local delete before/after counts', { before, after });
    if (before === after) return { success: false, error: 'Habit not found' };
    this.saveHabitsToStorage();
    // notify listeners
    try { this.habitsListeners.forEach(fn => fn(this.habits)); } catch (e) { console.warn(e); }
    try { window.dispatchEvent(new CustomEvent('metis:habits-updated', { detail: { userId } })); } catch (e) {}
    console.debug('[enhancedApi] Local delete succeeded for habitId=', habitId);
    return { success: true };
    } catch (error) {
      console.error('Error deleting habit:', error);
      return { success: false, error: 'Failed to delete habit' };
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
        ...(newEntry as JournalEntry),
        id: Date.now(),
      };

  // Persist in local in-memory array and localStorage
  this.journalEntries.unshift(mockEntry);
  this.saveJournalToStorage();

  // Notify journal listeners
  try { this.journalListeners.forEach(fn => { try { fn(this.journalEntries); } catch (e) { console.warn('journal listener call failed', e); } }); } catch (e) { console.warn('Failed to notify journal listeners:', e); }

  // Dispatch an event for other parts of the app
  try { window.dispatchEvent(new CustomEvent('metis:journal-updated', { detail: { userId: this.getCurrentUserId() } })); } catch (e) {}

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
      
  // Fallback: load from per-user localStorage
  this.loadJournalFromStorage();
  console.debug('[enhancedApi] returning journal entries count=', this.journalEntries.length);
  return this.journalEntries;
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
      
      // Try to load from localStorage first (per-user key)
      let profile = this.loadProfileFromStorage();

      // If no profile in storage, create a new one with sensible defaults
      if (!profile) {
        console.log('No profile found, creating new one');
        profile = {
          id: userId,
          username: this.getCurrentUserName() || "NewUser",
          email: this.getCurrentUserEmail() || "",
          current_xp: 0,
          level: 1,
          total_habits: 0, // Will be updated based on actual habits
          achievements: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Save new profile to localStorage (and Supabase fallback below)
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

  // Upsert (create or update) user profile to Supabase or localStorage
  async upsertUserProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const userId = profile.id || this.getCurrentUserId();
      if (!userId) throw new Error('No user id for profile');

      // Detect whether a profile already existed to avoid seeding defaults for existing accounts
      let hadProfile = false;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', userId)
            .single();
          if (error) {
            // PGRST116 = not found; treat as no profile
            if ((error as any).code === 'PGRST116') {
              hadProfile = false;
            } else {
              // On unexpected errors, assume profile exists to avoid accidental seeding
              console.warn('Supabase profile lookup error, skipping seeding to be safe:', error);
              hadProfile = true;
            }
          } else if (data) {
            hadProfile = true;
          }
        } catch (e) {
          console.warn('Supabase profile check threw; assume profile exists to avoid seeding:', e);
          hadProfile = true;
        }
      } else {
        hadProfile = !!this.loadProfileFromStorage();
      }

      // Perform upsert (Supabase preferred)
      let savedProfile: UserProfile | null = null;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .upsert(profile, { onConflict: 'id' })
            .select()
            .single();
          if (error) {
            console.warn('Supabase upsert error, falling back to local save:', error);
            this.saveProfileToStorage(profile);
            savedProfile = profile;
          } else {
            this.saveProfileToStorage(data);
            savedProfile = data;
          }
        } catch (err) {
          console.warn('Supabase upsert threw, falling back to localStorage:', err);
          this.saveProfileToStorage(profile);
          savedProfile = profile;
        }
      } else {
        // Local fallback
        this.saveProfileToStorage(profile);
        savedProfile = profile;
      }

      // Only seed default habits when there was NO prior profile (brand-new account)
      if (!hadProfile) {
        try {
          this.loadHabitsFromStorage();
          const existing = this.habits;
          if (!existing || existing.length === 0) {
            // Seed two example habits for truly new users
            this.habits = [
              {
                id: Date.now() + 1,
                user_id: userId,
                title: 'Morning Meditation',
                description: 'Find inner peace like the ancient philosophers',
                icon: '🧘‍♂️',
                category: 'mindfulness',
                difficulty: 'easy',
                suggested_frequency: 'daily',
                mythic_title: 'Path of the Serene Oracle',
                wisdom: 'In stillness, wisdom speaks loudest.',
                current_streak: 0,
                completion_rate: 0,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: Date.now() + 2,
                user_id: userId,
                title: 'Physical Training',
                description: 'Strengthen body and mind like Spartan warriors',
                icon: '💪',
                category: 'health',
                difficulty: 'medium',
                suggested_frequency: 'daily',
                mythic_title: 'Forge of the Titan',
                wisdom: 'Strength grows in the crucible of discipline.',
                current_streak: 0,
                completion_rate: 0,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ];
            this.saveHabitsToStorage();
            try { window.dispatchEvent(new CustomEvent('metis:habits-updated', { detail: { userId } })); } catch (e) {}
          }
        } catch (e) {
          console.warn('Seeding defaults failed:', e);
        }
      }

      return savedProfile as UserProfile;
    } catch (error) {
      console.error('Error upserting profile:', error);
      throw error;
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