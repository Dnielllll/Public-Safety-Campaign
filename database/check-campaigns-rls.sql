-- Check and fix RLS policies for campaigns table
-- This will only add missing policies without trying to drop existing ones

-- Add policy for staff to view all campaigns (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaigns' 
    AND policyname = 'Staff can view all campaigns'
  ) THEN
    CREATE POLICY "Staff can view all campaigns"
      ON public.campaigns FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid() AND users.role IN ('staff', 'admin', 'super_admin', 'superadmin')
        )
      );
  END IF;
END $$;

-- Add policy for public to view published campaigns (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaigns' 
    AND policyname = 'Public can view published campaigns'
  ) THEN
    CREATE POLICY "Public can view published campaigns"
      ON public.campaigns FOR SELECT
      TO anon, authenticated
      USING (status = 'published');
  END IF;
END $$;

-- Add policy for users to view own campaigns (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaigns' 
    AND policyname = 'Users can view own campaigns'
  ) THEN
    CREATE POLICY "Users can view own campaigns"
      ON public.campaigns FOR SELECT
      TO authenticated
      USING (created_by = auth.uid());
  END IF;
END $$;

-- Grant permissions
GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT ON public.campaigns TO authenticated;

-- Test: Check existing policies
SELECT policyname, tablename, permissive, roles 
FROM pg_policies 
WHERE tablename = 'campaigns'
ORDER BY policyname;