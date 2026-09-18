-- ============================================================
-- FIX CREATE_USER_BY_ADMIN FUNCTION CONFLICT
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================
-- This removes the duplicate function versions and creates
-- a single consistent version with allowed_modules support
-- ============================================================

-- Drop all versions of the function to prevent conflicts
DROP FUNCTION IF EXISTS public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]);

-- Create the unified function with allowed_modules support
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
  p_email    TEXT,
  p_password TEXT,
  p_name     TEXT,
  p_role     TEXT DEFAULT 'staff',
  p_phone    TEXT DEFAULT '',
  p_address  TEXT DEFAULT '',
  p_allowed_modules TEXT[] DEFAULT ARRAY[]::TEXT[]
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

  -- Security check: only active admins or superadmins can call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'super_admin') AND is_active = true
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
    NOW(), -- email already confirmed
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'name', p_name,
      'role', p_role,
      'phone', p_phone,
      'address', p_address,
      'allowed_modules', p_allowed_modules
    ),
    false,
    NOW(),
    NOW(),
    '', '', '', ''
  );

  -- Step 2: Create public.users row
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
    p_email,
    p_name,
    p_role,
    p_phone,
    p_address,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = COALESCE(EXCLUDED.name, public.users.name),
    role       = COALESCE(EXCLUDED.role, public.users.role),
    phone      = COALESCE(EXCLUDED.phone, public.users.phone),
    address    = COALESCE(EXCLUDED.address, public.users.address),
    is_active  = true,
    updated_at = NOW();

  -- Return success result
  result := jsonb_build_object(
    'success', true,
    'user_id', new_uid,
    'email', p_email,
    'name', p_name,
    'role', p_role,
    'message', 'User created successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create user'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;

-- Verify the function was created successfully
SELECT 'create_user_by_admin function fixed successfully!' AS status;