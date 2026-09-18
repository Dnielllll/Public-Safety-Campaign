-- Disable email confirmation for new user registrations
-- This allows users to sign up without needing to click a confirmation link

-- Update Supabase Auth settings to disable email confirmation
-- Note: This needs to be run in Supabase Dashboard → Authentication → Providers → Email
-- Or via Supabase Management API

-- SQL alternative approach (if supported):
-- This disables email confirmation by updating the auth configuration

-- Option 1: Via SQL (if your Supabase instance supports it)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Option 2: Create a trigger to auto-confirm new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm the user's email
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id;
  
  -- Insert into public.users (if not already handled by triggers)
  INSERT INTO public.users (id, email, name, phone, address, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'public'),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO anon;