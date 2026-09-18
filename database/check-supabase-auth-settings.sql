-- ============================================================
-- CHECK SUPABASE AUTH SETTINGS AND CONFIGURATION
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- This checks if there are any database-level issues affecting Auth
-- ============================================================

-- Check if auth.users table has any constraints
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check for any auth-related triggers that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth';

-- Check the current RLS status on auth tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'auth';

-- Check if there are any foreign key constraints that might be blocking
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'users' OR tc.table_name LIKE '%user%');