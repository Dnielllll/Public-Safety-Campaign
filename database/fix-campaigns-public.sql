-- ============================================================
-- FIX: Allow everyone to view published campaigns (public portal)
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- Allow ALL users (even unauthenticated/anonymous visitors) to see published campaigns
DROP POLICY IF EXISTS "Public can view published campaigns" ON public.campaigns;
CREATE POLICY "Public can view published campaigns" ON public.campaigns
  FOR SELECT USING (status = 'published');

-- Allow authenticated users (staff/admin) to view all campaigns (for management)
DROP POLICY IF EXISTS "Staff can view own campaigns" ON public.campaigns;
CREATE POLICY "Staff can view own campaigns" ON public.campaigns
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

SELECT 'Campaigns RLS fixed! Published campaigns are now visible to everyone.' AS status;
