-- Initialize system_settings table with a default row
-- This ensures there's always a row to read from and update

-- First, check if the table exists and has the right columns
DO $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    general_settings JSONB DEFAULT '{}'::jsonb,
    security_settings JSONB DEFAULT '{}'::jsonb,
    auth_settings JSONB DEFAULT '{}'::jsonb,
    notification_settings JSONB DEFAULT '{}'::jsonb,
    feature_settings JSONB DEFAULT '{}'::jsonb,
    ai_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
  );
END $$;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.system_settings;
DROP POLICY IF EXISTS "All authenticated users can view general_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow public read access to system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated update access to system_settings" ON public.system_settings;

-- READ: everyone (including anonymous/public) can read settings
CREATE POLICY "Enable read access for all users"
  ON public.system_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- UPDATE: only admin/super_admin can update
CREATE POLICY "Admins can update system settings"
  ON public.system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- INSERT: only admin/super_admin can insert
CREATE POLICY "Admins can insert system settings"
  ON public.system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Insert the default row if no rows exist
INSERT INTO public.system_settings (
  general_settings,
  security_settings,
  auth_settings,
  notification_settings,
  feature_settings,
  ai_settings
)
SELECT
  '{"barangayName": "Barangay 178", "city": "North Caloocan City", "district": "Camarin", "contactNumber": "", "timezone": "Asia/Manila", "language": "en", "maintenance_mode": false}'::jsonb,
  '{"sslEnabled": true, "csrfProtection": true, "rateLimiting": true, "rateLimitPerMinute": 100, "auditLogging": true, "dataEncryption": true, "backupRetentionDays": 30}'::jsonb,
  '{"sessionTimeout": 4, "maxLoginAttempts": 5, "lockoutDuration": 15, "passwordMinLength": 8, "passwordRequireUppercase": true, "passwordRequireNumbers": true, "passwordRequireSpecialChars": true, "twoFactorEnabled": false, "ipWhitelist": ""}'::jsonb,
  '{"smsEnabled": false, "emailEnabled": false, "facebookEnabled": false, "pushEnabled": false, "systemAlerts": true, "emergencyAlerts": true, "maintenanceAlerts": true, "securityAlerts": true}'::jsonb,
  '{"realTimeUpdates": true, "analyticsEnabled": true, "campaignApprovalRequired": true, "citizenRegistrationRequired": false, "userRegistrationEnabled": true}'::jsonb,
  '{"aiAssistantEnabled": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- Verify the result
SELECT id, 
  general_settings->>'maintenance_mode' as maintenance_mode
FROM public.system_settings;
