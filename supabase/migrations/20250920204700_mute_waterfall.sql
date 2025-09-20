/*
  # Complete Metis Database Schema

  1. New Tables
    - `habits` - User habits with AI-enhanced metadata
    - `journal_entries` - Journal entries with AI analysis
    - `quests` - Dynamic quests and challenges
    - `habit_completions` - Daily habit completion tracking
    - `achievements` - User achievements system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - `increment_user_xp` - Function to safely increment user XP
    - `calculate_level` - Function to calculate user level from XP
*/

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT '📚',
  category text,
  difficulty text DEFAULT 'medium',
  suggested_frequency text DEFAULT 'daily',
  mythic_title text,
  wisdom text,
  current_streak integer DEFAULT 0,
  completion_rate integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  entry text NOT NULL,
  mood text DEFAULT 'neutral',
  obstacles jsonb DEFAULT '[]'::jsonb,
  mythic_advice text,
  oracle_title text,
  actionable_steps jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  description text,
  type text DEFAULT 'daily' CHECK (type IN ('daily', 'weekly', 'monthly')),
  xp_reward integer DEFAULT 0,
  progress integer DEFAULT 0,
  total integer DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create habit_completions table for tracking daily completions
CREATE TABLE IF NOT EXISTS habit_completions (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  habit_id bigint NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  xp_gained integer DEFAULT 25,
  created_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT '🏆',
  category text,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policies for habits table
CREATE POLICY "Users can manage own habits"
  ON habits
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((jwt() ->> 'sub'::text) = user_id);

-- Policies for journal_entries table
CREATE POLICY "Users can manage own journal entries"
  ON journal_entries
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((jwt() ->> 'sub'::text) = user_id);

-- Policies for quests table
CREATE POLICY "Users can manage own quests"
  ON quests
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((jwt() ->> 'sub'::text) = user_id);

-- Policies for habit_completions table
CREATE POLICY "Users can manage own habit completions"
  ON habit_completions
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((jwt() ->> 'sub'::text) = user_id);

-- Policies for achievements table
CREATE POLICY "Users can manage own achievements"
  ON achievements
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((jwt() ->> 'sub'::text) = user_id);

-- Function to safely increment user XP
CREATE OR REPLACE FUNCTION increment_user_xp(user_id text, xp_amount integer)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    current_xp = current_xp + xp_amount,
    level = calculate_level(current_xp + xp_amount),
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- This means: Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
  RETURN GREATEST(1, floor(sqrt(xp::float / 100)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_status ON habits(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Update user_profiles table to include level calculation trigger
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = calculate_level(NEW.current_xp);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update level when XP changes
DROP TRIGGER IF EXISTS trigger_update_user_level ON user_profiles;
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF current_xp ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();