-- ============================================================
-- FIX: Allow Staff and Admins to manage feedback
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. Create a SECURITY DEFINER function to securely check staff status
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'staff'
  );
$$;

-- 2. Allow Staff to view all feedback
DROP POLICY IF EXISTS "Staff can view all feedback" ON public.feedback;
CREATE POLICY "Staff can view all feedback" ON public.feedback
  FOR SELECT USING (public.is_staff());

-- 3. Allow Staff to update feedback (so they can flag items)
DROP POLICY IF EXISTS "Staff can update feedback" ON public.feedback;
CREATE POLICY "Staff can update feedback" ON public.feedback
  FOR UPDATE USING (public.is_staff());

-- 4. Allow Admins to update feedback (so they can save responses)
DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;
CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE USING (public.is_admin());

SELECT 'Successfully added Feedback RLS policies for Staff and Admin!' AS status;
