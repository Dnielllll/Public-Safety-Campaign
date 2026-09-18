-- =============================================================================
-- verify_user_password RPC
-- Step 1: Enable pgcrypto (required for crypt() function)
-- Step 2: Create the verify_user_password function
-- Run this entire script in your Supabase SQL Editor.
-- =============================================================================

-- Enable pgcrypto extension (needed for crypt() password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop old version if it exists
DROP FUNCTION IF EXISTS public.verify_user_password(text);

CREATE OR REPLACE FUNCTION public.verify_user_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, auth, public
AS $$
DECLARE
  user_id uuid;
  is_valid boolean;
BEGIN
  -- Get the currently authenticated user
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Compare entered password against stored bcrypt hash using pgcrypto
  SELECT (encrypted_password = extensions.crypt(password, encrypted_password))
  INTO is_valid
  FROM auth.users
  WHERE id = user_id;

  RETURN COALESCE(is_valid, false);
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.verify_user_password(text) TO authenticated;
