/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (text, primary key) - Auth0 user ID
      - `username` (text)
      - `email` (text)
      - `current_xp` (integer, default 0)
      - `level` (integer, default 1)
      - `total_habits` (integer, default 0)
      - `achievements` (jsonb, default empty array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read/write their own profile
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id text PRIMARY KEY,
  username text NOT NULL,
  email text NOT NULL,
  current_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  total_habits integer DEFAULT 0,
  achievements jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'sub' = id)
  WITH CHECK (auth.jwt() ->> 'sub' = id);