-- ============================================================
-- FIX: Add INSERT policy for public.users table
-- This allows authenticated users to create their own profile row
-- when the handle_new_user trigger doesn't fire properly.
-- 
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

SELECT 'INSERT policy added successfully!' AS status;
