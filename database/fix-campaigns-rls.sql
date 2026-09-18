-- Fix RLS policies for campaigns table to allow staff to view all campaigns
-- This is needed for the "All Campaigns" feature

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Public can view published campaigns" ON public.campaigns;

-- New policy: Staff can view ALL campaigns (for duplicate checking)
CREATE POLICY "Staff can view all campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
    )
  );

-- New policy: Public users can view published campaigns only
CREATE POLICY "Public can view published campaigns"
  ON public.campaigns FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- New policy: Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT ON public.campaigns TO authenticated;

-- Test the policies
SELECT 'Testing campaign access...' as status;

-- Test staff access (should see all campaigns)
-- This will be tested when a staff user logs in