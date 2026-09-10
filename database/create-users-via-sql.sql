-- ============================================================
-- CREATE USERS DIRECTLY VIA SQL (Bypasses Supabase Auth signUp)
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================
-- This script creates BOTH the auth.users row AND public.users row
-- No email confirmation needed. Works even when signups are disabled.
-- ============================================================

-- HOW TO USE:
-- 1. Copy this entire script
-- 2. Replace the values in the VARIABLES section below
-- 3. Run it in Supabase SQL Editor
-- ============================================================


-- ============================================================
-- CREATE STAFF USER: adam@gmail.com / adam123
-- ============================================================
DO $$
DECLARE
  new_uid UUID := gen_random_uuid();
BEGIN

  -- Step 1: Insert into auth.users (Supabase Auth table)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'adam@gmail.com',                          -- << CHANGE EMAIL HERE
    crypt('adam123', gen_salt('bf')),           -- << CHANGE PASSWORD HERE
    NOW(),                                      -- email already confirmed
    '{"provider":"email","providers":["email"]}',
    '{"name":"Adam Lorenzo","role":"staff"}',   -- << CHANGE NAME HERE
    false,
    NOW(),
    NOW(),
    '', '', '', ''
  );

  -- Step 2: Insert into public.users (app profile table)
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
    new_uid,
    'adam@gmail.com',                          -- << SAME EMAIL
    'Adam Lorenzo',                            -- << SAME NAME
    'staff',                                   -- << role: admin / staff / public
    '',                                        -- phone (optional)
    '',                                        -- address (optional)
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'staff',
    is_active = true,
    updated_at = NOW();

  RAISE NOTICE 'User created successfully with UID: %', new_uid;
END $$;

-- Verify the user was created
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  pu.name,
  pu.role,
  pu.is_active
FROM auth.users au
JOIN public.users pu ON pu.id = au.id
WHERE au.email = 'adam@gmail.com';   -- << CHANGE TO VERIFY YOUR EMAIL


-- ============================================================
-- TEMPLATE: Copy and edit below to create MORE users
-- ============================================================
/*
DO $$
DECLARE
  new_uid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    new_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'CHANGE_EMAIL@example.com',
    crypt('CHANGE_PASSWORD', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"CHANGE_NAME","role":"staff"}',
    false, NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO public.users (id, email, name, role, phone, address, is_active, created_at, updated_at)
  VALUES (new_uid, 'CHANGE_EMAIL@example.com', 'CHANGE_NAME', 'staff', '', '', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'staff', is_active = true, updated_at = NOW();

  RAISE NOTICE 'Created: %', new_uid;
END $$;
*/
