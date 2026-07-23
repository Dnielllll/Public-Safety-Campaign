-- ============================================================
-- RPC FUNCTION: create_user_by_admin
-- Allows admin to create staff/resident accounts directly via SQL
-- Works even when "Allow new users to sign up" is DISABLED
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- Step 0: Enable pgcrypto extension (required for crypt() and gen_salt())
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.create_user_by_admin(
  p_email    TEXT,
  p_password TEXT,
  p_name     TEXT,
  p_role     TEXT DEFAULT 'staff',
  p_phone    TEXT DEFAULT '',
  p_address  TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  result  JSON;
BEGIN

  -- Security check: only admins can call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Only active admins can create users';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email address % is already registered', p_email;
  END IF;

  -- Step 1: Create auth.users row (bypasses signup restrictions)
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
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('name', p_name, 'role', p_role, 'phone', p_phone, 'address', p_address)::jsonb,
    false,
    NOW(),
    NOW(),
    '', '', '', ''
  );

  -- Step 2: Create public.users profile row
  INSERT INTO public.users (
    id, email, name, role, phone, address, is_active, created_at, updated_at
  ) VALUES (
    new_uid, p_email, p_name, p_role,
    NULLIF(p_phone, ''), NULLIF(p_address, ''),
    true, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role       = p_role,
    name       = p_name,
    phone      = NULLIF(p_phone, ''),
    address    = NULLIF(p_address, ''),
    is_active  = true,
    updated_at = NOW();

  result := json_build_object(
    'id',    new_uid,
    'email', p_email,
    'name',  p_name,
    'role',  p_role
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users (RLS inside function handles admin check)
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;

SELECT 'RPC function create_user_by_admin created successfully!' AS status;
