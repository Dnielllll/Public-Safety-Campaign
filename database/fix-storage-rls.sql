-- Fix RLS policy for storage bucket
-- This allows authenticated users to upload to the campaign-content bucket

-- Disable RLS on storage objects (this is for the storage bucket, not the table)
-- Note: Storage RLS is managed differently than table RLS

-- Option 1: Disable RLS on storage (simplest for development)
-- Run this in Supabase Dashboard → Storage → campaign-content bucket → Policies
-- Or use the SQL below if you have the storage extension enabled

-- For Supabase Storage, you need to manage policies through the Dashboard:
-- 1. Go to Storage → campaign-content bucket
-- 2. Click "Policies"
-- 3. Disable RLS or create policies that allow authenticated users

-- Alternative: Create policies to allow authenticated users
INSERT INTO storage.policies (name, definition, operation, table_name)
VALUES 
  ('campaign-content-upload', 'auth.uid() IS NOT NULL', 'INSERT', 'objects')
ON CONFLICT (name) DO UPDATE SET definition = 'auth.uid() IS NOT NULL';

INSERT INTO storage.policies (name, definition, operation, table_name)
VALUES 
  ('campaign-content-select', 'true', 'SELECT', 'objects')
ON CONFLICT (name) DO UPDATE SET definition = 'true';

-- If the above doesn't work, you need to do it through the Dashboard:
-- 1. Go to Storage → campaign-content
-- 2. Click "Policies" 
-- 3. Click "Disable RLS" or create policies that allow uploads
