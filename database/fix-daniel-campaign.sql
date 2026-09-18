-- ============================================================
-- Fix problematic email addresses and create system_settings table
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- Step 1: Find all problematic email addresses
SELECT 
  id,
  name,
  email,
  role,
  is_active
FROM public.users 
WHERE email IN ('superadmin@gmail.com', 'superadmin178@gmail.com')
  OR email ILIKE '%superadmin%'
ORDER BY created_at DESC;

-- Step 2: DEACTIVATE the problematic account (safer than deleting)
-- This will prevent bounce-back emails while keeping the account intact
UPDATE public.users 
SET is_active = false 
WHERE email = 'superadmin@gmail.com';

-- Step 3: Verify the fix
SELECT 
  id,
  name,
  email,
  role,
  is_active
FROM public.users 
WHERE email ILIKE '%superadmin%';

-- Step 4: Check all current residents (citizens and public users)
SELECT 
  id,
  name,
  email,
  role,
  is_active
FROM public.users 
WHERE role IN ('citizen', 'public') AND is_active = true
ORDER BY created_at DESC;

-- Step 5: Check existing system_settings table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'system_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: Check if table already has data
SELECT COUNT(*) as count FROM public.system_settings;

-- Step 7: Insert default settings if table is empty (using UUID if needed)
-- First, try with integer ID (if table uses bigint)
DO $$
BEGIN
  -- Check if the table uses UUID or integer ID
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_settings' 
    AND table_schema = 'public' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Use UUID approach
    INSERT INTO public.system_settings (id, general_settings, security_settings, auth_settings, notification_settings, feature_settings, ai_settings)
    VALUES (
      gen_random_uuid(),
      '{"barangayName": "Barangay 178", "city": "North Caloocan City", "district": "Camarin", "contactNumber": "", "timezone": "Asia/Manila", "language": "en", "maintenance_mode": false}',
      '{"sslEnabled": true, "csrfProtection": true, "rateLimiting": true, "rateLimitPerMinute": 100, "auditLogging": true, "dataEncryption": true, "backupRetentionDays": 30}',
      '{"sessionTimeout": 30, "maxLoginAttempts": 5, "lockoutDuration": 15, "passwordMinLength": 8, "passwordRequireUppercase": true, "passwordRequireNumbers": true, "passwordRequireSpecialChars": true, "twoFactorEnabled": false, "ipWhitelist": ""}',
      '{"smsEnabled": true, "emailEnabled": true, "facebookEnabled": true, "pushEnabled": true, "systemAlertsEnabled": true, "emergencyAlertsEnabled": true, "maintenanceAlertsEnabled": true, "securityAlertsEnabled": true}',
      '{"aiAssistantEnabled": true, "voiceAnnouncementsEnabled": true, "realTimeUpdates": true, "analyticsEnabled": true, "campaignApprovalRequired": true, "citizenRegistrationRequired": false, "userRegistrationEnabled": true}',
      '{"defaultVoice": "fil-PH-Wavenet-A", "speakingRate": "1.0", "autoGenerateVoice": true, "serviceAccountKey": ""}'
    )
    ON CONFLICT DO NOTHING;
  ELSE
    -- Use integer approach
    INSERT INTO public.system_settings (id, general_settings, security_settings, auth_settings, notification_settings, feature_settings, ai_settings)
    VALUES (
      1,
      '{"barangayName": "Barangay 178", "city": "North Caloocan City", "district": "Camarin", "contactNumber": "", "timezone": "Asia/Manila", "language": "en", "maintenance_mode": false}',
      '{"sslEnabled": true, "csrfProtection": true, "rateLimiting": true, "rateLimitPerMinute": 100, "auditLogging": true, "dataEncryption": true, "backupRetentionDays": 30}',
      '{"sessionTimeout": 30, "maxLoginAttempts": 5, "lockoutDuration": 15, "passwordMinLength": 8, "passwordRequireUppercase": true, "passwordRequireNumbers": true, "passwordRequireSpecialChars": true, "twoFactorEnabled": false, "ipWhitelist": ""}',
      '{"smsEnabled": true, "emailEnabled": true, "facebookEnabled": true, "pushEnabled": true, "systemAlertsEnabled": true, "emergencyAlertsEnabled": true, "maintenanceAlertsEnabled": true, "securityAlertsEnabled": true}',
      '{"aiAssistantEnabled": true, "voiceAnnouncementsEnabled": true, "realTimeUpdates": true, "analyticsEnabled": true, "campaignApprovalRequired": true, "citizenRegistrationRequired": false, "userRegistrationEnabled": true}',
      '{"defaultVoice": "fil-PH-Wavenet-A", "speakingRate": "1.0", "autoGenerateVoice": true, "serviceAccountKey": ""}'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Step 8: Fix RLS policies for system_settings table
-- Disable RLS temporarily
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;

-- Step 9: Enable RLS with permissive policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated update access to system_settings" ON public.system_settings;

-- Allow public read access (for the system to function)
CREATE POLICY "Allow public read access to system_settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

-- Allow authenticated users to update system_settings
CREATE POLICY "Allow authenticated update access to system_settings" 
ON public.system_settings 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Step 10: Verify system_settings table
SELECT * FROM public.system_settings;
