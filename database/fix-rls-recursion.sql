-- ============================================================
-- FIX: Resolve infinite recursion in users RLS policies
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. Create a SECURITY DEFINER function to check admin status securely
-- SECURITY DEFINER runs with elevated privileges, bypassing RLS to prevent recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Update the offending policies to use the new function
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.is_admin());

SELECT 'Successfully fixed RLS recursion!' AS status;
