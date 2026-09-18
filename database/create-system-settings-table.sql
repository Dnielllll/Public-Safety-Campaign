-- Create system_settings table for storing system-wide configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  general_settings JSONB DEFAULT '{
    "appName": "Barangay 178 Safety Campaign Management System",
    "appVersion": "1.0.0",
    "barangayName": "Barangay 178",
    "city": "North Caloocan City",
    "district": "Camarin",
    "contactNumber": "",
    "timezone": "Asia/Manila",
    "language": "en",
    "maintenance_mode": false
  }'::jsonb,
  security_settings JSONB DEFAULT '{
    "sslEnabled": true,
    "csrfProtection": true,
    "rateLimiting": true,
    "rateLimitPerMinute": 100,
    "auditLogging": true,
    "dataEncryption": true,
    "backupRetentionDays": 30
  }'::jsonb,
  auth_settings JSONB DEFAULT '{
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "lockoutDuration": 15,
    "passwordMinLength": 8,
    "passwordRequireUppercase": true,
    "passwordRequireNumbers": true,
    "passwordRequireSpecialChars": true,
    "twoFactorEnabled": false,
    "ipWhitelist": ""
  }'::jsonb,
  notification_settings JSONB DEFAULT '{
    "smsEnabled": true,
    "emailEnabled": true,
    "facebookEnabled": true,
    "pushEnabled": true,
    "systemAlertsEnabled": true,
    "emergencyAlertsEnabled": true,
    "maintenanceAlertsEnabled": true,
    "securityAlertsEnabled": true
  }'::jsonb,
  feature_settings JSONB DEFAULT '{
    "aiAssistantEnabled": true,
    "voiceAnnouncementsEnabled": true,
    "realTimeUpdates": true,
    "analyticsEnabled": true,
    "campaignApprovalRequired": true,
    "citizenRegistrationRequired": false,
    "userRegistrationEnabled": true
  }'::jsonb,
  ai_settings JSONB DEFAULT '{
    "defaultVoice": "fil-PH-Wavenet-A",
    "speakingRate": "1.0",
    "autoGenerateVoice": true,
    "serviceAccountKey": ""
  }'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only admins and super admins can view settings
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
CREATE POLICY "Admins can view system settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Only admins and super admins can update settings
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
CREATE POLICY "Admins can update system settings"
  ON public.system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Only admins and super admins can insert settings
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
CREATE POLICY "Admins can insert system settings"
  ON public.system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Insert default settings if table is empty
INSERT INTO public.system_settings (id, general_settings)
VALUES (
  gen_random_uuid(),
  '{
    "appName": "Barangay 178 Safety Campaign Management System",
    "appVersion": "1.0.0",
    "barangayName": "Barangay 178",
    "city": "North Caloocan City",
    "district": "Camarin",
    "contactNumber": "",
    "timezone": "Asia/Manila",
    "language": "en",
    "maintenance_mode": false
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON public.system_settings(updated_at DESC);

-- Enable realtime for system_settings
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;