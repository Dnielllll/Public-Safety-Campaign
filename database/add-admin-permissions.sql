-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Adds allowed_modules column for RBAC and updates the RPC
-- ============================================================

-- 1. Add allowed_modules column to public.users if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'allowed_modules'
  ) THEN 
    ALTER TABLE public.users ADD COLUMN allowed_modules TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF; 
END $$;


-- 2. Drop the old function if it exists to prevent overloaded function errors
DROP FUNCTION IF EXISTS public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 3. Update the create_user_by_admin RPC to accept allowed_modules
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
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('name', p_name, 'role', p_role, 'phone', p_phone, 'address', p_address, 'allowed_modules', p_allowed_modules)::jsonb,
    false,
    NOW(),
    NOW(),
    '', '', '', ''
  );

  -- Step 2: Create public.users profile row
  INSERT INTO public.users (
    id, email, name, role, phone, address, allowed_modules, is_active, created_at, updated_at
  ) VALUES (
    new_uid, p_email, p_name, p_role,
    NULLIF(p_phone, ''), NULLIF(p_address, ''), p_allowed_modules,
    true, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role       = p_role,
    name       = p_name,
    phone      = NULLIF(p_phone, ''),
    address    = NULLIF(p_address, ''),
    allowed_modules = p_allowed_modules,
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

GRANT EXECUTE ON FUNCTION public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;

SELECT 'Schema and RPC successfully updated with allowed_modules for RBAC!' AS status;
