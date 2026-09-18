-- ============================================================
-- Check and fix user ID mismatch for campaigns
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- First, let's check the current users and their campaigns
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  u.role,
  COUNT(c.id) as campaign_count
FROM public.users u
LEFT JOIN public.campaigns c ON c.created_by = u.id
GROUP BY u.id, u.name, u.email, u.role
ORDER BY campaign_count DESC;

-- Check campaigns with their creator information
SELECT 
  c.id as campaign_id,
  c.title,
  c.status,
  c.created_by,
  u.name as creator_name,
  u.email as creator_email
FROM public.campaigns c
LEFT JOIN public.users u ON c.created_by = u.id
ORDER BY c.created_at DESC;

-- If you find the issue, you can update the created_by field
-- Replace 'YOUR_EMAIL_HERE' with your actual email and 'YOUR_USER_ID_HERE' with your user ID
-- UPDATE public.campaigns 
-- SET created_by = 'YOUR_USER_ID_HERE' 
-- WHERE created_by IN (
--   SELECT id FROM public.users WHERE email = 'YOUR_EMAIL_HERE'
-- );

-- Verify the fix
SELECT 
  c.id as campaign_id,
  c.title,
  c.status,
  c.created_by,
  u.name as creator_name,
  u.email as creator_email
FROM public.campaigns c
LEFT JOIN public.users u ON c.created_by = u.id
WHERE c.title LIKE '%Fire Safety%'
ORDER BY c.created_at DESC;
