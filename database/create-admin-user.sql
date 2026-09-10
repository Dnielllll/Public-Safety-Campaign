-- Script to create admin users in Supabase
-- Run this in your Supabase SQL Editor after creating the user in Supabase Auth

-- IMPORTANT: First create the user in Supabase Auth dashboard (Authentication > Users > Add user)
-- Then replace the UUID below with the actual user ID from Supabase Auth

-- Create admin user
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  phone,
  address,
  is_active,
  created_at,
  updated_at
) VALUES (
  '4295a83d-efa9-49aa-97b7-3230b41829ea',
  'admin@barangay178.gov.ph',
  'System Administrator',
  'admin',
  '09123456789',
  'Barangay Hall, Camarin, North Caloocan City',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- ============================================
-- STAFF USER - Redirects to /staff dashboard
-- ============================================
-- First create staff user in Supabase Auth, then replace UUID below and uncomment
-- INSERT INTO public.users (
--   id,
--   email,
--   name,
--   role,
--   phone,
--   address,
--   is_active,
--   created_at,
--   updated_at
-- ) VALUES (
--   'REPLACE_WITH_STAFF_UUID_HERE',
--   'staff@barangay178.gov.ph',
--   'Staff User',
--   'staff',
--   '09123456788',
--   'Barangay Hall, Camarin, North Caloocan City',
--   true,
--   NOW(),
--   NOW()
-- ) ON CONFLICT (id) DO UPDATE SET
--   role = 'staff',
--   is_active = true,
--   updated_at = NOW();

-- ============================================
-- RESIDENT USER - Redirects to / (resident portal)
-- ============================================
-- Residents are created automatically when they register via the app
-- No manual SQL needed - they get role: 'public' by default
-- If you need to create a resident manually, uncomment and replace UUID:
-- INSERT INTO public.users (
--   id,
--   email,
--   name,
--   role,
--   phone,
--   address,
--   is_active,
--   created_at,
--   updated_at
-- ) VALUES (
--   'REPLACE_WITH_RESIDENT_UUID_HERE',
--   'resident@example.com',
--   'Resident Name',
--   'public',
--   '09123456787',
--   'Purok 1, Camarin, North Caloocan City',
--   true,
--   NOW(),
--   NOW()
-- ) ON CONFLICT (id) DO UPDATE SET
--   role = 'public',
--   is_active = true,
--   updated_at = NOW();
