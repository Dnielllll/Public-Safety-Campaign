-- ============================================================
-- FINAL FIX: Allow all authenticated users to read feedback
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- Drop ALL existing feedback policies to start clean
DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Residents can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Staff can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Staff can update feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;
DROP POLICY IF EXISTS "Authenticated users can view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Authenticated users can update feedback" ON public.feedback;

-- Allow any logged-in user to INSERT feedback
CREATE POLICY "Authenticated users can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow any logged-in user to READ all feedback (staff/admin can see everything)
CREATE POLICY "Authenticated users can view feedback" ON public.feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow any logged-in user to UPDATE feedback (for admin responses)
CREATE POLICY "Authenticated users can update feedback" ON public.feedback
  FOR UPDATE USING (auth.uid() IS NOT NULL);

SELECT 'Feedback RLS fixed! All authenticated users can now view feedback.' AS status;
