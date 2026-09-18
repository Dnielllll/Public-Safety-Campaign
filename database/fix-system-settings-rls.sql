-- Fix RLS policies for system_settings table
-- Allow all authenticated users to read general_settings (for maintenance mode check)
-- Only allow admins to modify settings

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow public read access to system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated update access to system_settings" ON public.system_settings;

-- New policy: All authenticated users can read general_settings (needed for maintenance mode check)
CREATE POLICY "All authenticated users can view general_settings"
  ON public.system_settings FOR SELECT
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