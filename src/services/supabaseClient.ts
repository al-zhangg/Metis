import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock data.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database schema types
export interface Habit {
  id: number;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  suggested_frequency: string;
  mythic_title: string;
  wisdom: string;
  current_streak: number;
  completion_rate: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  user_id: string;
  entry: string;
  mood: string;
  obstacles: string[];
  mythic_advice: string;
  oracle_title: string;
  actionable_steps: string[];
  created_at: string;
}

export interface Quest {
  id: number;
  user_id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  xp_reward: number;
  progress: number;
  total: number;
  status: 'active' | 'completed';
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  current_xp: number;
  level: number;
  total_habits: number;
  achievements: any[];
  created_at: string;
  updated_at: string;
}