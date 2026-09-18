-- ============================================================
-- DELETE ALtnaofumi@gmail.com (Danny Dioso) USER FROM DATABASE
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================
-- This script removes the user altnaofumi@gmail.com from both
-- auth.users and public.users tables
-- ============================================================

-- First, delete from child tables that reference users
-- Delete audit trail records
DELETE FROM public.audit_trail WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'altnaofumi@gmail.com'
);

-- Delete campaign-related records (if they exist)
DELETE FROM public.campaigns WHERE created_by IN (
  SELECT id FROM auth.users WHERE email = 'altnaofumi@gmail.com'
);

-- Delete feedback records (if they exist)
DELETE FROM public.feedback WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'altnaofumi@gmail.com'
);

-- Delete from public.users
DELETE FROM public.users WHERE email = 'altnaofumi@gmail.com';

-- Delete from auth.users
DELETE FROM auth.users WHERE email = 'altnaofumi@gmail.com';

-- Verify deletion
SELECT 'User altnaofumi@gmail.com deletion completed' as status;
SELECT id, email, name, role, is_active 
FROM public.users 
WHERE email = 'altnaofumi@gmail.com';