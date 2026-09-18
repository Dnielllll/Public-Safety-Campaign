-- Find orphaned auth users (users in auth.users but not in public.users)
-- This helps identify users like "Danny" who exist in auth but not in your app

-- Step 1: Get all users from auth.users (this requires admin access)
-- Note: You'll need to run this in Supabase SQL Editor with service role privileges

-- Step 2: Compare with public.users to find orphans
-- Run this query to identify the orphaned users:

SELECT 
  au.id as auth_id,
  au.email as auth_email,
  au.created_at as auth_created_at,
  au.last_sign_in_at as auth_last_sign_in,
  CASE 
    WHEN pu.id IS NULL THEN 'ORPHANED - Not in public.users'
    ELSE 'Exists in both tables'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Step 3: To delete a specific orphaned auth user (like Danny), 
-- run this with the specific email or user ID:

-- Replace 'danny@example.com' with the actual email
-- DELETE FROM auth.users WHERE email = 'danny@example.com';

-- Or delete by user ID if you know it:
-- DELETE FROM auth.users WHERE id = 'user-uuid-here';

-- WARNING: Be very careful with DELETE operations on auth.users!