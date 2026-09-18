-- Fix RLS policies for system_settings table - More permissive approach
-- Allow ALL users (including unauthenticated) to read general_settings
-- Only allow admins to modify settings

-- Drop existing policies
DROP POLICY IF EXISTS "All authenticated users can view general_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.system_settings;

-- New policy: Allow ALL users (including unauthenticated) to read general_settings
-- This is needed for maintenance mode check before login
CREATE POLICY "Enable read access for all users"
  ON public.system_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- New policy: Only admins can modify settings
CREATE POLICY "Admins can update system settings"
  ON public.system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- New policy: Only admins can insert settings
CREATE POLICY "Admins can insert system settings"
  ON public.system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );