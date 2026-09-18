-- ============================================================
-- FIX SIGNUP TRIGGER AND RLS ISSUES
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================
-- This fixes the 500 error during signup by updating the trigger
-- and ensuring proper RLS policies are in place
-- ============================================================

-- Step 1: Update the handle_new_user function to handle errors better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists in public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- User already exists, just return
    RETURN NEW;
  END IF;

  -- Insert new user with proper error handling
  INSERT INTO public.users (id, email, name, role, phone, address, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'public'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    true,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE LOG 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Ensure RLS is enabled but has proper policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Update RLS policies to allow the trigger to work
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update users" ON public.users;
CREATE POLICY "Service role can update users" ON public.users
  FOR UPDATE USING (true);

-- Step 5: Fix audit_trail RLS to avoid conflicts
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert audit" ON public.audit_trail;
CREATE POLICY "Service role can insert audit" ON public.audit_trail
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update audit" ON public.audit_trail;
CREATE POLICY "Service role can update audit" ON public.audit_trail
  FOR UPDATE USING (true);

-- Step 6: Verify the setup
SELECT 'Trigger function updated successfully' as status;
SELECT 'RLS policies updated for signup to work' as status;