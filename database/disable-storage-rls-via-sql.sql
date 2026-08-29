-- Disable RLS for storage bucket via SQL
-- Run this in Supabase SQL Editor

-- First, check if storage extension is available
SELECT * FROM pg_extension WHERE extname = 'storage';

-- Disable RLS on storage objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Grant permissions on storage
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO anon;

-- If the above doesn't work, try this alternative approach
-- This directly modifies the storage policies
DELETE FROM storage.policies WHERE bucket_id = 'campaign-content';

-- Or create a permissive policy for the campaign-content bucket
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES 
  ('campaign-content-all', 'campaign-content', 'true', '*')
ON CONFLICT (name) DO UPDATE SET definition = 'true';
