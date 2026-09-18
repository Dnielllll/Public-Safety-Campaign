-- ============================================================
-- DISABLE EMAIL CONFIRMATION IN SUPABASE AUTH
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- This disables email confirmation which might be causing 500 errors
-- if email sending is not properly configured
-- ============================================================

-- Note: This requires access to Supabase Auth settings which may not be
-- available via SQL. You may need to do this in the Supabase Dashboard:
-- 1. Go to Authentication → Settings
-- 2. Disable "Confirm email" 
-- 3. Or check if email provider is properly configured

-- Alternative: Check if there are any database constraints on auth.users
SELECT 
    'Checking auth.users constraints' as info;
    
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
AND table_name = 'users';

-- Check if there are any database functions that might be interfering
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'auth';

-- Most likely the issue is in Supabase Dashboard Auth settings
-- Please check:
-- 1. Authentication → Settings → Email settings
-- 2. Authentication → Settings → Confirm email (try disabling it)
-- 3. Authentication → Providers → Email (check if enabled)