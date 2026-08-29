-- ============================================================
-- FIX: Complete RLS Fix (Recursion-free & Role-based Access)
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. Redefine roles helper functions to use auth.jwt() metadata (100% recursion-proof)
-- This avoids querying public.users directly inside the policy check, eliminating RLS infinite loops.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'staff';
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'staff');
$$;

-- 2. Update users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.is_admin());


-- 3. Update feedback table policies
DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedback;
CREATE POLICY "Public can submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
CREATE POLICY "Admins can view all feedback" ON public.feedback
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Staff can view all feedback" ON public.feedback;
CREATE POLICY "Staff can view all feedback" ON public.feedback
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can update feedback" ON public.feedback;
CREATE POLICY "Staff can update feedback" ON public.feedback
  FOR UPDATE USING (public.is_staff());

DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;
CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE USING (public.is_admin());


-- 4. Update campaigns table policies
DROP POLICY IF EXISTS "Public can view published campaigns" ON public.campaigns;
CREATE POLICY "Public can view published campaigns" ON public.campaigns
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Staff can view own campaigns" ON public.campaigns;
CREATE POLICY "Staff can view own campaigns" ON public.campaigns
  FOR SELECT USING (created_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Staff can create campaigns" ON public.campaigns;
CREATE POLICY "Staff can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff can update own campaigns" ON public.campaigns;
CREATE POLICY "Staff can update own campaigns" ON public.campaigns
  FOR UPDATE USING (created_by = auth.uid() OR public.is_admin());


-- 5. Update engagement_logs policies
DROP POLICY IF EXISTS "Staff and admins can view engagement" ON public.engagement_logs;
CREATE POLICY "Staff and admins can view engagement" ON public.engagement_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_staff());


-- 6. Update campaign_evaluations policies
DROP POLICY IF EXISTS "Staff and admins can manage evaluations" ON public.campaign_evaluations;
CREATE POLICY "Staff and admins can manage evaluations" ON public.campaign_evaluations
  FOR ALL USING (public.is_admin_or_staff());


-- 7. Update volunteers policies
DROP POLICY IF EXISTS "Users and admins can view volunteers" ON public.volunteers;
CREATE POLICY "Users and admins can view volunteers" ON public.volunteers
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_staff());

SELECT 'All RLS policies successfully updated and secured!' AS status;
